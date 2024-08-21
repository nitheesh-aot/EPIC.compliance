"""Project Model."""

from sqlalchemy import Column, Integer, String

from .db import db


class Project(db.Model):
    """Project Model Class."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    ea_certificate = Column(String(255), nullable=True, default=None)
    proponent_name = Column(String, nullable=False)

    def __setattr__(self, key, value):
        """Set attribute value."""
        if hasattr(self, key):
            raise AttributeError(f"Cannot modify {key}. This class is read-only.")
        super().__setattr__(key, value)
