"""Model class to handle the firstnations to an inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class InspectionFirstnation(BaseModel):
    """Model class for firstnations associted with the inspection."""

    __tablename__ = "inspection_firstnations"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    firstnation_id = Column(
        Integer,
        nullable=False,
        comment="The unique identifier of the first nation entity from track app",
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="inspection_agencies_inspection_id_fkey"),
        nullable=False,
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")

    @classmethod
    def get_all_firstnations_inspection_id(cls, inspection_id: int):
        """Retrieve all firstnations by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete_firstnations_by_ids(
        cls, inspection_id: int, firstnation_ids: list[int], session=None
    ):
        """Delete firstnation ids by id per inspection."""
        query = session.query(InspectionFirstnation) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.firstnation_id.in_(firstnation_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert_firstnation_per_inspection(
        cls, inspection_id: int, firstnation_ids: list[int], session=None
    ):
        """Insert firstnation per inspection."""
        inspection_firstnation_data = [
            InspectionFirstnation(
                **{"inspection_id": inspection_id, "firstnation_id": firstnation_id}
            )
            for firstnation_id in firstnation_ids
        ]
        if session:
            session.add_all(inspection_firstnation_data)
            session.flush()
        else:
            cls.session.add_all(inspection_firstnation_data)
            cls.session.commit()
