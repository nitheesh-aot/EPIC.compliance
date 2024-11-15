"""ContinuationReport Service."""

from compliance_api.auth import auth
from compliance_api.exceptions import PermissionDeniedError
from compliance_api.models.continuation_report import ContinuationReport as ContinuationReportModel
from compliance_api.models.continuation_report import ContinuationReportKey as ContinuationReportKeyModel
from compliance_api.models.db import session_scope
from compliance_api.utils.enum import PermissionEnum


class ContinuationReportService:
    """ContinuationReportService."""

    @classmethod
    def create(cls, report_entry: dict, ho_session=None):
        """Create continuation report entry."""
        _access_check(report_entry)
        report_entry_obj = _create_report_entry(report_entry)
        with session_scope() as session:
            created_entry = ContinuationReportModel.create_entry(
                report_entry_obj, ho_session or session
            )
            keys = report_entry.get("keys", [])
            _insert_or_update_keys(created_entry.id, keys, ho_session or session)
        return created_entry

    @classmethod
    def get_by_case_file_id(cls, case_file_id, page_no, page_size, search_text):
        """Get all crs by case file id."""
        return ContinuationReportModel.get_by_case_file(
            case_file_id, page_no, page_size, search_text
        )


def _access_check(report_entry: dict):
    """Access check."""
    from compliance_api.services.case_file import CaseFileService  # pylint: disable=import-outside-toplevel
    if not auth.has_permission(
        [PermissionEnum.SUPERUSER]
    ) and not CaseFileService.is_logged_user_primary_or_officer(
        report_entry.get("case_file_id")
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )


def _insert_or_update_keys(report_id, keys, session=None):
    """Insert or update keys for continuatino report."""
    if keys:
        existing_keys = ContinuationReportKeyModel.get_by_report_id(report_id)
        existing_keys = {
            entry.key for entry in existing_keys if entry.is_active is True
        }

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


def _create_report_entry(report_entry_data: dict):
    """Create the report entry object."""
    text = report_entry_data.get("text")
    return {
        "case_file_id": report_entry_data.get("case_file_id"),
        "text": text,
        "rich_text": report_entry_data.get("rich_text"),
        "date_created": report_entry_data.get("date_created"),
        "context_type": report_entry_data.get("context_type"),
        "context_id": report_entry_data.get("context_id"),
    }
