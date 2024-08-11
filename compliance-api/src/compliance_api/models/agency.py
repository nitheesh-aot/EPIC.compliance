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
