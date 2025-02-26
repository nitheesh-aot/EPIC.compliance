"""Model to handle appendices."""

from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class Appendix(BaseModelVersioned):
    """Definition of the Appendix entity."""

    __tablename__ = "appendices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="appendix_inspection_id_inspection_id_fkey"),
        nullable=False,
        comment="The unique identifier of the inspection",
    )
    appendix_no = Column(Integer, nullable=False)
    document_title = Column(String, nullable=False)
    is_deleted = Column(Boolean, default=False, server_default="f", nullable=False)
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    __table_args__ = (
        Index(
            "unique_non_deleted_appendix_number",  # Index name
            "inspection_id",
            "appendix_no",
            unique=True,
            postgresql_where=(is_deleted is False),  # Condition for uniqueness
        ),
    )

    @classmethod
    def get_by_no_nd_inspection(cls, appendix_no: int, inspection_id: int):
        """Get appendix by name."""
        return cls.query.filter_by(
            appendix_no=appendix_no, inspection_id=inspection_id, is_deleted=False
        ).first()

    @classmethod
    def get_by_inspection_id(cls, inspection_id: int):
        """Get all appendices by inspection id."""
        return cls.query.filter_by(
            inspection_id=inspection_id, is_deleted=False, is_active=True
        ).all()
