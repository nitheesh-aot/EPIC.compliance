"""Model to handle appendices."""

from sqlalchemy import Column, Integer, String

from .base_model import BaseModelVersioned


class Appendix(BaseModelVersioned):
    """Definition of the Appendix entity."""

    __tablename__ = "appendices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    appendix_no = Column(Integer, unique=True, nullable=False)
    document_title = Column(String, nullable=False)
