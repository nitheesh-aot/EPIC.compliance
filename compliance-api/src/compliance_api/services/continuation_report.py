"""ContinuationReport Service."""

from flask import g

from compliance_api.auth import auth
from compliance_api.exceptions import PermissionDeniedError
from compliance_api.models.continuation_report import ContinuationReport as ContinuationReportModel
from compliance_api.models.continuation_report import ContinuationReportKey as ContinuationReportKeyModel
from compliance_api.models.db import session_scope
from compliance_api.services.case_file import CaseFileService
from compliance_api.utils.enum import PermissionEnum


class ContinuationReportService:
    """ContinuationReportService."""

    @classmethod
    def create(cls, report_entry: dict, system_generated=False):
        """Create continuation report entry."""
        _access_check(report_entry)
        report_entry_obj = _create_report_entry(report_entry, system_generated)
        with session_scope() as session:
            created_entry = ContinuationReportModel.create_entry(
                report_entry_obj, session
            )
            keys = report_entry.get("keys", [])
            _insert_or_update_keys(created_entry.id, keys, session)
        return created_entry

    @classmethod
    def update(cls, entry_id, report_entry: dict):
        """Update continuation report entry."""
        entry = ContinuationReportModel.find_by_id(entry_id)
        if not entry:
            return None
        _access_check_update_delete(entry.case_file_id, entry.created_by)
        with session_scope() as session:
            ContinuationReportModel.update_entry(entry_id, report_entry, session)
            keys = report_entry.get("keys", [])
            _insert_or_update_keys(entry_id, keys, session)

    @classmethod
    def delete(cls, entry_id):
        """Delete continuation report entry."""
        entry = ContinuationReportModel.find_by_id(entry_id)
        _access_check_update_delete(entry.case_file_id, entry.created_by)
        if not entry:
            return None
        with session_scope() as session:
            ContinuationReportModel.update_entry(
                entry_id, {"is_deleted": True, "is_active": False}, session
            )
            _insert_or_update_keys(entry_id, [], session)

    @classmethod
    def get_by_case_file_id(cls, case_file_id, page_no, page_size, search_text):
        """Get all crs by case file id."""
        return ContinuationReportModel.get_by_case_file(
            case_file_id, page_no, page_size, search_text
        )


def _access_check(report_entry: dict):
    """Access check."""
    if not auth.has_permission(
        [PermissionEnum.SUPERUSER]
    ) and not CaseFileService.is_logged_user_primary_or_officer(
        report_entry.get("case_file_id")
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )


def _access_check_update_delete(case_file_id, created_by):
    """Access check for update."""
    auth_user_guid = g.token_info["preferred_username"]
    if auth.has_permission([PermissionEnum.SUPERUSER]):
        return
    if (
        auth_user_guid == created_by
        and CaseFileService.is_logged_user_primary_or_officer(case_file_id)
    ):
        return
    raise PermissionDeniedError(
        "You don't have the correct permission to perform this operation."
    )


def _insert_or_update_keys(report_id, keys, session=None):
    """Insert or update keys for continuatino report."""
    existing_keys = ContinuationReportKeyModel.get_by_report_id(report_id)
    existing_keys = {entry.key for entry in existing_keys if entry.is_active is True}

    new_keys = {key.get("key") for key in keys}
    keys_to_be_deleted = existing_keys.difference(new_keys)
    keysto_be_added = new_keys.difference(existing_keys)
    if keys_to_be_deleted:
        ContinuationReportKeyModel.bulk_delete(
            report_id, list(keys_to_be_deleted), session
        )
    if keysto_be_added:
        key_objects = [key for key in keys if key.get("key") in keysto_be_added]
        ContinuationReportKeyModel.bulk_insert(report_id, key_objects, session)


def _create_report_entry(report_entry_data: dict, sys_generated=False):
    """Create the report entry object."""
    text = report_entry_data.get("text")
    if sys_generated:
        rich_text = f"<p>{text}</p>"
    else:
        rich_text = report_entry_data.get("rich_text")
    return {
        "case_file_id": report_entry_data.get("case_file_id"),
        "text": text,
        "rich_text": rich_text,
        "date_created": report_entry_data.get("date_created"),
        "context_type": report_entry_data.get("context_type"),
        "context_id": report_entry_data.get("context_id"),
    }
