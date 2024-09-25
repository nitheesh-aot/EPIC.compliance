"""Requirement source service."""

from compliance_api.models import RequirementSource as RequirementSourceModel


class RequirementSourceService:
    """Requirement source service."""

    @classmethod
    def get_requirement_sources(cls):
        """Get requirement sources."""
        return RequirementSourceModel.get_all(sort_by="sort_order")
