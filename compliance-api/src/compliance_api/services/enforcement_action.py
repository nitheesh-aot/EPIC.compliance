"""Enforcement Action service."""

from compliance_api.models import EnforcementActionOption as EnforcementActionOptionModel


class EnforcementActionService:
    """Enforcement action service."""

    @classmethod
    def get_enforcement_actions(cls):
        """Get enforcement actions."""
        return EnforcementActionOptionModel.get_all(sort_by="sort_order")
