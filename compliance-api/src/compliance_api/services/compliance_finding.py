"""Compliance finding service."""

from compliance_api.models import ComplianceFindingOption as ComplianceFindingOptionModel


class ComplianceFindingService:
    """Compliance finding service."""

    @classmethod
    def get_compliance_findings(cls):
        """Get compliance finding options."""
        return ComplianceFindingOptionModel.get_all(sort_by="sort_order")
