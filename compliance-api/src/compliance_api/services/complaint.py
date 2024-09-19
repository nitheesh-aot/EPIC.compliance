"""Service for managing complaint."""

from compliance_api.models.complaint import ComplaintSource as ComplaintSourceModel


class ComplaintService:
    """Complaint Service."""

    @classmethod
    def get_complaint_sources(cls):
        """Get complaint sources."""
        return ComplaintSourceModel.get_all(sort_by="sort_order")

    @classmethod
    def create(cls, complaint_data: dict):
        """Create complaint."""
        pass  # pylint: disable=unnecessary-pass
