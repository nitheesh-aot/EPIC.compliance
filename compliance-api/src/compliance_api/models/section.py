"""Section model."""

from sqlalchemy import Column, Integer, String

from .base_model import BaseModelVersioned


class Section(BaseModelVersioned):
    """Section model."""

    __tablename__ = "sections"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
