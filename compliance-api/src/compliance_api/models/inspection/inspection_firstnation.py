"""Model class to handle the firstnations to an inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned, db
from ..inspection.inspection import Inspection as InspectionModel


class InspectionFirstnation(BaseModelVersioned):
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
    def get_all_by_inspection(cls, inspection_id: int):
        """Retrieve all firstnations by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(cls, inspection_id: int, firstnation_ids: list[int], session=None):
        """Delete firstnation ids by id per inspection."""
        query = session.query(InspectionFirstnation) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.firstnation_id.in_(firstnation_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert(cls, inspection_id: int, firstnation_ids: list[int], session=None):
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
            db.session.add_all(inspection_firstnation_data)
            db.session.commit()

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete firstnation info by case_file_id."""
        firstnations = (
            cls.query.join(InspectionModel)
            .filter(
                InspectionModel.case_file_id == case_file_id,
                InspectionFirstnation.is_deleted is False,
            )
            .all()
        )
        firstnation_ids = [firstnation.id for firstnation in firstnations]
        if firstnation_ids:
            cls.query.filter(InspectionFirstnation.id.in_(firstnation_ids)).update(
                {cls.is_deleted: True, cls.is_active: False}
            )
            if session:
                session.flush()
            else:
                db.session.commit()

    @classmethod
    def delete_inspection_firstnation(cls, inspection_id, session=None):
        """Delete inspection firstnation."""
        cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).update(
            {cls.is_deleted: True, cls.is_active: False}
        )
        if session:
            session.flush()
        else:
            db.session.commit()
