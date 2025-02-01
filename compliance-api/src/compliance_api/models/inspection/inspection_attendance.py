"""Model to manage the choosen attendance option for inspection."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned
from ..inspection.inspection import Inspection as InspectionModel
from ..utils import with_session


class InspectionAttendance(BaseModelVersioned):
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
    @with_session
    def bulk_delete(cls, inspection_id: int, option_ids: list[int], session=None):
        """Delete attendance ids by id per inspection."""
        attendances = cls.query.filter(
            cls.inspection_id == inspection_id, cls.attendance_option_id.in_(option_ids)
        ).all()
        for att in attendances:
            att.update(DELETE_DIC_PARAMS, commit=False)
        session.flush()

    @classmethod
    @with_session
    def bulk_insert(cls, inspection_id: int, option_ids: list[int], session=None):
        """Insert attendance per inspection."""
        inspection_officer_data = [
            InspectionAttendance(
                **{"inspection_id": inspection_id, "attendance_option_id": option_id}
            )
            for option_id in option_ids
        ]
        session.add_all(inspection_officer_data)
        session.flush()

    @classmethod
    @with_session
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete attendance by case_file_id."""
        attendances = (
            cls.query.join(InspectionModel)
            .filter(
                InspectionModel.case_file_id == case_file_id,
                InspectionAttendance.is_deleted is False,
            )
            .all()
        )
        attendance_ids = [attendance.id for attendance in attendances]
        if attendance_ids:
            attendances = cls.query.filter(
                InspectionAttendance.id.in_(attendance_ids)
            ).all()
            for att in attendances:
                att.update(DELETE_DIC_PARAMS, commit=False)
        session.flush()

    @classmethod
    @with_session
    def delete_inspection_attendance(cls, inspection_id, session=None):
        """Delete inspection Attendance."""
        attendances = cls.query.filter_by(
            inspection_id=inspection_id, is_deleted=False
        ).all()
        for att in attendances:
            att.update(DELETE_DIC_PARAMS, commit=False)
        session.flush()
