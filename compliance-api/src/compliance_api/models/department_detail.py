"""The static details of a department."""

from sqlalchemy import Column, Integer, String

from .base_model import BaseModelVersioned


class DepartmentDetail(BaseModelVersioned):
    """The static details of a department."""

    __tablename__ = "department_details"

    id = Column(Integer, primary_key=True)
    logo_url = Column(String, nullable=True)
    email = Column(String, nullable=False)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    website = Column(String, nullable=True)
