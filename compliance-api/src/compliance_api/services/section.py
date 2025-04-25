"""Section Service."""

from ..models.section import Section as SectionModel


class SectionService:
    """Service layer for Section operations."""

    @classmethod
    def get_active_sections(cls) -> list:
        """Retrieve all valid active sections."""
        return SectionModel.get_all()
