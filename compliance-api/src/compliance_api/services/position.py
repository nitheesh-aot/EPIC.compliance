"""Service for position."""
from compliance_api.models import Position as PositionModel


class PositionService:
    """Position service."""

    @classmethod
    def get_all_positions(cls):
        """Get all positions."""
        return PositionModel.get_all()
