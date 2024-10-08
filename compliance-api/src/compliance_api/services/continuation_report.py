"""ContinuationReport Service."""

from compliance_api.models.continuation_report import ContinuationReport as ContinuationReportModel
from compliance_api.models.db import session_scope


class ContinuationReportService:
    """ContinuationReportService."""

    @classmethod
    def create(cls, report_entry: dict, system_generated=False):
        """Create continuation report entry."""
        report_entry_obj = _create_report_entry(report_entry, system_generated)
        with session_scope() as session:
            ContinuationReportModel.create_entry(report_entry_obj, session)


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
