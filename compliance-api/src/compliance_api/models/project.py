"""Project Model."""

from sqlalchemy import Column, Integer, String

from .base_model import BaseModel


class Project(BaseModel):
    """Project Model Class."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
