"""Model class to handle the types of the inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


class InspectionType(BaseModelVersioned):
    """Model class for types associted with the inspection."""

    __tablename__ = "inspection_types"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    type_id = Column(
        Integer,
        ForeignKey("inspection_type_options.id", name="inspection_types_type_id_type_id_fkey"),
        nullable=False,
        comment="The unique identifier of inspection type option",
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="inspection_agencies_inspection_id_fkey"),
        nullable=False,
        comment="The unique identifier of the inspection",
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    type = relationship("InspectionTypeOption", foreign_keys=[type_id], lazy="select")

    @classmethod
    def get_all_by_inspection(cls, inspection_id: int):
        """Retrieve all inspection types by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(
        cls, inspection_id: int, type_ids: list[int], session=None
    ):
        """Delete inspection type."""
        query = session.query(InspectionType) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.type_id.in_(type_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert(
        cls, inspection_id: int, type_ids: list[int], session=None
    ):
        """Insert type per inspection."""
        inspection_ir_type_data = [
            InspectionType(**{"inspection_id": inspection_id, "type_id": type_id})
            for type_id in type_ids
        ]
        if session:
            session.add_all(inspection_ir_type_data)
            session.flush()
        else:
            cls.session.add_all(inspection_ir_type_data)
            cls.session.commit()
