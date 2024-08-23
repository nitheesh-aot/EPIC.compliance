# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Inspection Model."""
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from .base_model import BaseModel


class Inspection(BaseModel):
    """Inspection Model Class"""

    __tablename__ = "inspections"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the inspection",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", name="inspections_project_id_projects_id_fkey"),
        nullable=False,
        comment="The unique identifier of the project associated with the inspection",
    )
    location_description = Column(
        String, nullable=True, comment="The location details of the inspection"
    )
    utm = Column(String, nullable=True, comment="The UTM value of the location")
    lead_officer_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="inspection_lead_officer_id_staff_id_fkey"),
        nullable=False,
        comment="The lead officer who created the inspection",
    )
    ir_type_id = Column(
        Integer,
        ForeignKey(
            "ir_type_options.id", name="inspection_ir_type_id_ir_type_options_id_fkey"
        ),
        nullable=False,
    )
    initiation_id = Column(
        Integer,
        ForeignKey("inspection_initiation_id_inspection_initiation_options_id_fkey"),
        nullable=False,
    )
    ir_status_id = Column(
        Integer,
        ForeignKey("inspection_ir_status_id_ir_status_options_id_fkey"),
        nullable=True,
    )

    initiation = relationship(
        "InspectionInitiationOption", foreign_keys=[initiation_id], lazy="select"
    )
    inspection_officers = relationship(
        "InspectionOfficer",
        back_populates="inspection",
        lazy="select",
    )
    ir_type = relationship("IRTypeOption", foreign_keys=[ir_type_id], lazy="joined")
    ir_status = relationship(
        "IRStatusOption", foreign_keys=[ir_status_id], lazy="joined"
    )
    project = relationship("Project", foreign_keys=[project_id], lazy="joined")


class InspectionOfficer(BaseModel):
    """Other officers associated with the inspection"""

    __tablename__ = "inspection_officers"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the inspection officers",
    )
    inspection_id = Column(
        Integer,
        ForeignKey(
            "inspections.id",
            name="inspection_officers_inspection_id_inspection_id_fkey",
        ),
        nullable=False,
        comment="The unique identifier of the associated inspection",
    )
    officer_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="case_file_officers_staff_users_id_fkey"),
        nullable=False,
        comment="The unique identifier of the associated staff user",
    )

    inspection = relationship(
        "Inpsection",
        back_populates="inspection_officers",
        lazy="joined",
    )
    officer = relationship("StaffUser", foreign_keys=[officer_id], lazy="joined")

    @classmethod
    def get_all_officers_by_inspection_id(cls, inspection_id: int):
        """Retrieve all case file officers by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id, is_deleted=False).all()

    @classmethod
    def bulk_delete_officers_by_ids(
        cls, inspection_id: int, officer_ids: list[int], session=None
    ):
        """Delete officer ids by id per inspection."""
        query = session.query(InspectionOfficer) if session else cls.query
        query.filter(
            cls.inspection_id == inspection_id, cls.officer_id.in_(officer_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert_officers_per_inspection(
        cls, inspection_id: int, officer_ids: list[int], session=None
    ):
        """Insert officers per inspection."""
        inspection_officer_data = [
            InspectionOfficer(
                **{"inspection_id": inspection_id, "officer_id": officer_id}
            )
            for officer_id in officer_ids
        ]
        if session:
            session.add_all(inspection_officer_data)
            session.flush()
        else:
            cls.session.add_all(inspection_officer_data)
            cls.session.commit()


class InspectionAttendanceOption(BaseModel):
    """Inspection attendance option categories"""

    __tablename__ = "attendance_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the attendance option",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )


class IRTypeOption(BaseModel):
    """Inspection Record type options"""

    __tablename__ = "ir_type_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the IR type option",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )


class InspectionInitiationOption(BaseModel):
    """Initiation options for creating an inspection"""

    __tablename__ = "inspection_initiation_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the IR type option",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )


class IRStatusOption(BaseModel):
    """IR Status options"""

    __tablename__ = "ir_status_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the IR type option",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )


class InspectionAttendance(BaseModel):
    """Inspection attendance category mapping"""

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
            "attendance_options.id",
            name="inspection_attendance_mappings_attendance_option_id_attendance_options_id_fkey",
        ),
        nullable=False,
    )
    inspection = relationship(
        "Inpsection",
        back_populates="inspection_attendance_mappings",
        lazy="joined",
    )
    attendance_option = relationship(
        "InspectionAttendanceOption", foreign_keys=[attendance_option_id], lazy="joined"
    )
