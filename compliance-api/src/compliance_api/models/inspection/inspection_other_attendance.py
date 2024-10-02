"""Model class to handle inspection other attendance."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


class InspectionOtherAttendance(BaseModelVersioned):
    """Model class to manage the other type of attendance for the inspection."""

    __tablename__ = "inspection_other_attendances"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    municipal = Column(String, nullable=True, comment="The municipal attendance")
    other = Column(
        String, nullable=True, comment="Any other attendance for the inspection"
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="other_attendance_inspection_id_fkey"),
        nullable=False,
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")

    @classmethod
    def create_attendance(cls, other_attendance_data, session=None):
        """Persist other attendance data in database."""
        attendance = InspectionOtherAttendance(**other_attendance_data)
        if session:
            session.add(attendance)
            session.flush()
        else:
            attendance.save()
        return attendance

    @classmethod
    def update_attendance(
        cls, inspection_id, other_attendance_data, session=None
    ):
        """Update the other attendance data in database."""
        query = cls.query.filter_by(inspection_id=inspection_id)
        attendance: InspectionOtherAttendance = query.first()
        if not attendance or attendance.is_deleted:
            return None
        query.update(other_attendance_data)
        if session:
            session.flush()
        else:
            cls.session.commit()
        return attendance
