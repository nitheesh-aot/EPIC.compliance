"""Service for position."""
from compliance_api.models import Position


class PositionService:
    """Position service."""

    @classmethod
    def get_all_positions(cls):
        """Get all positions."""
        return Position.get_all()
