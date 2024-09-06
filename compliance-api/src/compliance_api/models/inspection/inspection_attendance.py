"""Model to manage the choosen attendance option for inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class InspectionAttendance(BaseModel):
    """Inspection attendance category mapping."""

    __tablename__ = "inspection_attendance_mappings"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the mapping",
    )
    inspection_id = Column(
        Integer,
        ForeignKey(
            "inspections.id",
            name="inspection_attendance_mappings_inspection_id_inspection_id_fkey",
        ),
        nullable=False,
    )
    attendance_option_id = Column(
        Integer,
        ForeignKey(
            "inspection_attendance_options.id",
            name="inspection_attendance_mappings_attendance_option_id_attendance_options_id_fkey",
        ),
        nullable=False,
    )
    inspection = relationship(
        "Inspection",
        foreign_keys=[inspection_id],
        lazy="select",
    )
    attendance_option = relationship(
        "InspectionAttendanceOption", foreign_keys=[attendance_option_id], lazy="select"
    )

    @classmethod
    def get_all_by_inspection(cls, inspection_id: int):
        """Retrieve all attendance option by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(cls, inspection_id: int, option_ids: list[int], session=None):
        """Delete attendance ids by id per inspection."""
        query = session.query(InspectionAttendance) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.attendance_option_id.in_(option_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert(cls, inspection_id: int, option_ids: list[int], session=None):
        """Insert attendance per inspection."""
        inspection_officer_data = [
            InspectionAttendance(
                **{"inspection_id": inspection_id, "attendance_option_id": option_id}
            )
            for option_id in option_ids
        ]
        if session:
            session.add_all(inspection_officer_data)
            session.flush()
        else:
            cls.session.add_all(inspection_officer_data)
            cls.session.commit()
