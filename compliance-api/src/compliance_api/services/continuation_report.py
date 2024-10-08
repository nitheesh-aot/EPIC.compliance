"""ContinuationReport Service."""

from compliance_api.models.continuation_report import ContinuationReport as ContinuationReportModel
from compliance_api.models.continuation_report import ContinuationReportKey as ContinuationReportKeyModel
from compliance_api.models.db import session_scope


class ContinuationReportService:
    """ContinuationReportService."""

    @classmethod
    def create(cls, report_entry: dict, system_generated=False):
        """Create continuation report entry."""
        report_entry_obj = _create_report_entry(report_entry, system_generated)
        with session_scope() as session:
            created_entry = ContinuationReportModel.create_entry(
                report_entry_obj, session
            )
            keys = report_entry.get("keys", [])
            _insert_or_update_keys(created_entry.id, keys, session)


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
        "context_type": report_entry_data.get("context_type"),
        "context_id": report_entry_data.get("context_id"),
    }
