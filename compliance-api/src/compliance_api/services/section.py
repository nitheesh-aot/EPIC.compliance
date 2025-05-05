"""Section Service."""

from ..models.section import Section as SectionModel


class SectionService:
    """Service layer for Section operations."""

    @classmethod
    def get_all(cls) -> list:
        """Retrieve all valid active sections."""
        return SectionModel.get_all(default_filters=False)
