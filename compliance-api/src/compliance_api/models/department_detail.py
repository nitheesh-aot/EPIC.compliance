"""The static details of a department"""

from .base_model import BaseModelVersioned
from sqlalchemy import Column, String, Integer


class DepartmentDetail(BaseModelVersioned):
    """The static details of a department"""
    __tablename__ = "department_details"

    id = Column(Integer, primary_key=True)
    logo_url = Column(String, nullable=True)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    website = Column(String, nullable=True)
