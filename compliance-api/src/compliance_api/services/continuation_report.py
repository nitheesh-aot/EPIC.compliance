"""ContinuationReport Service"""
from compliance_api.models.db import session_scope


class ContinuationReportService:
    """ContinuationReportService"""
    @classmethod
    def create(cls, report_entry: dict):
        """Create continuation report entry"""
