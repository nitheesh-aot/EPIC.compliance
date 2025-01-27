"""Model class to handle inspection other attendance."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned, db
from ..inspection.inspection import Inspection as InspectionModel


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
    def get_by_inspection(cls, inspection_id):
        """Return attendance information by inspection."""
        return cls.query.filter_by(
            inspection_id=inspection_id, is_deleted=False
        ).first()

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
    def update_attendance(cls, inspection_id, other_attendance_data, session=None):
        """Update other attendance."""
        query = cls.query.filter_by(inspection_id=inspection_id)
        attendance: InspectionOtherAttendance = query.first()
        if attendance:
            attendance.update(other_attendance_data, commit=False)
        else:
            session.add(InspectionOtherAttendance(**other_attendance_data))
        if session:
            session.flush()
        else:
            db.session.commit()
        return attendance

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete other attendance details by case_file_id."""
        other_attendances = (
            cls.query.join(InspectionModel)
            .filter(
                InspectionModel.case_file_id == case_file_id,
                InspectionOtherAttendance.is_deleted is False,
            )
            .all()
        )
        attendance_ids = [att.id for att in other_attendances]
        if attendance_ids:
            attendances = cls.query.filter(
                InspectionOtherAttendance.id.in_(attendance_ids)
            ).all()
            for att in attendances:
                att.update(DELETE_DIC_PARAMS, commit=False)
            if session:
                session.flush()
            else:
                db.session.commit()

    @classmethod
    def delete_inspection_attendance(cls, inspection_id, session=None):
        """Delete inspection other attendance."""
        other_attendances = cls.query.filter_by(
            inspection_id=inspection_id, is_deleted=False
        ).all()
        for att in other_attendances:
            att.update(DELETE_DIC_PARAMS, commit=False)
        if session:
            session.flush()
        else:
            db.session.commit()
