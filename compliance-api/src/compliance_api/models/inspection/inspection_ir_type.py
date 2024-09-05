"""Model class to handle the IR Type of the inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class InspectionIRType(BaseModel):
    """Model class for agencies associted with the inspection."""

    __tablename__ = "inspection_ir_types"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    ir_type_id = Column(
        Integer,
        ForeignKey("ir_type_options.id", name="inspection_ir_types_type_id_ir_type_id_fkey"),
        nullable=False,
        comment="The unique identifier of ir type option",
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="inspection_agencies_inspection_id_fkey"),
        nullable=False,
        comment="The unique identifier of the inspection",
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    ir_type_option = relationship("IRTypeOption", foreign_keys=[ir_type_id], lazy="select")

    @classmethod
    def get_all_ir_types_inspection_id(cls, inspection_id: int):
        """Retrieve all ir types by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete_ir_type_by_ids(
        cls, inspection_id: int, ir_type_ids: list[int], session=None
    ):
        """Delete agency ids by id per inspection."""
        query = session.query(InspectionIRType) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.ir_type_id.in_(ir_type_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert_ir_type_per_inspection(
        cls, inspection_id: int, ir_type_ids: list[int], session=None
    ):
        """Insert ir type per inspection."""
        inspection_ir_type_data = [
            InspectionIRType(**{"inspection_id": inspection_id, "ir_type_id": ir_type_id})
            for ir_type_id in ir_type_ids
        ]
        if session:
            session.add_all(inspection_ir_type_data)
            session.flush()
        else:
            cls.session.add_all(inspection_ir_type_data)
            cls.session.commit()
