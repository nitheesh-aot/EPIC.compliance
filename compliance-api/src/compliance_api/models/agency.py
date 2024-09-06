"""Staff agency model class.

Manages the agency
"""

from __future__ import annotations

from sqlalchemy import Column, Integer, String

from .base_model import BaseModel


class Agency(BaseModel):
    """Definition of the Agency entity."""

    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    abbreviation = Column(String(10), nullable=True)

    @classmethod
    def get_by_name(cls, agency_name: str) -> Agency:
        """Get agency by name."""
        return cls.query.filter_by(name=agency_name, is_deleted=False).first()
