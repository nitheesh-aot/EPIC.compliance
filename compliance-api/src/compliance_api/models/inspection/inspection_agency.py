"""Model class to handle the attendance of agencies to an inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


class InspectionAgency(BaseModelVersioned):
    """Model class for agencies associted with the inspection."""

    __tablename__ = "inspection_agencies"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    agency_id = Column(
        Integer,
        ForeignKey("agencies.id", name="inspection_agencies_agency_id_agency_id_fkey"),
        nullable=False,
        comment="The unique identifier of agency",
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="inspection_agencies_inspection_id_fkey"),
        nullable=False,
        comment="The unique identifier of the inspection",
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    agency = relationship("Agency", foreign_keys=[agency_id], lazy="select")

    @classmethod
    def get_all_by_inspection(cls, inspection_id: int):
        """Retrieve all agencies by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(
        cls, inspection_id: int, agency_ids: list[int], session=None
    ):
        """Delete agency ids by id per inspection."""
        query = session.query(InspectionAgency) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.agency_id.in_(agency_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert(
        cls, inspection_id: int, agency_ids: list[int], session=None
    ):
        """Insert agencies per inspection."""
        inspection_agency_data = [
            InspectionAgency(**{"inspection_id": inspection_id, "agency_id": agency_id})
            for agency_id in agency_ids
        ]
        if session:
            session.add_all(inspection_agency_data)
            session.flush()
        else:
            cls.session.add_all(inspection_agency_data)
            cls.session.commit()
