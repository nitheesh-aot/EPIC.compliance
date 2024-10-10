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
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned
from .inspection_enum import InspectionStatusEnum


class Inspection(BaseModelVersioned):
    """Inspection Model Class."""

    __tablename__ = "inspections"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the inspection",
    )
    ir_number = Column(
        String(50),
        comment="The unique inspection record number",
        unique=True,
        index=True,
        nullable=False,
    )
    case_file_id = Column(
        Integer,
        ForeignKey("case_files.id", name="inspections_case_file_id_case_file_id_fkey"),
        nullable=False,
        comment="The unique identifier of the case file associated with the inspection",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", name="inspections_project_id_projects_id_fkey"),
        nullable=True,
        comment="The unique identifier of the project associated with the inspection",
    )
    project_description = Column(
        String,
        nullable=True,
        comment="The description of the project associated with the inspection",
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
    start_date = Column(
        DateTime(timezone=True),
        nullable=False,
        comment="The inspection start date",
    )
    end_date = Column(
        DateTime(timezone=True), nullable=False, comment="The inspection end date"
    )
    initiation_id = Column(
        Integer,
        ForeignKey(
            "inspection_initiation_options.id",
            name="inspection_initiation_id_inspection_initiation_options_id_fkey",
        ),
        nullable=False,
    )
    ir_status_id = Column(
        Integer,
        ForeignKey(
            "ir_status_options.id",
            name="inspection_ir_status_id_ir_status_options_id_fkey",
        ),
        nullable=True,
    )
    inspection_status = Column(Enum(InspectionStatusEnum), nullable=True)
    project_status_id = Column(
        Integer,
        ForeignKey(
            "project_status_options.id",
            name="inspection_project_status_id_project_status_options_id_fkey",
        ),
        nullable=True,
    )

    initiation = relationship(
        "InspectionInitiationOption", foreign_keys=[initiation_id], lazy="joined"
    )
    case_file = relationship("CaseFile", foreign_keys=[case_file_id], lazy="joined")
    other_officers = relationship(
        "InspectionOfficer",
        back_populates="inspection",
        lazy="select",
    )
    attendance = relationship(
        "InspectionAttendance", back_populates="inspection", lazy="select"
    )
    agencies = relationship(
        "InspectionAgency", back_populates="inspection", lazy="select"
    )
    first_nations = relationship(
        "InspectionFirstnation", back_populates="inspection", lazy="select"
    )
    unapproved_project_info = relationship(
        "InspectionUnapprovedProject", back_populates="inspection", lazy="select"
    )
    types = relationship("InspectionType", back_populates="inspection", lazy="select")
    ir_status = relationship(
        "IRStatusOption", foreign_keys=[ir_status_id], lazy="joined"
    )
    project = relationship("Project", foreign_keys=[project_id], lazy="joined")
    project_status = relationship(
        "ProjectStatusOption", foreign_keys=[project_status_id], lazy="joined"
    )
    lead_officer = relationship(
        "StaffUser", foreign_keys=[lead_officer_id], lazy="joined"
    )

    @classmethod
    def get_count_by_project_nd_case_file_id(cls, project_id: int, case_file_id: int):
        """Return the number of inspection based on the project and case file id."""
        result = (
            cls.query.with_entities(
                Inspection.case_file_id,
                Inspection.project_id,
                func.count(Inspection.id).label(  # pylint: disable=not-callable
                    "inspection_count"
                ),
            )
            .filter_by(project_id=project_id, case_file_id=case_file_id)
            .group_by(Inspection.case_file_id, Inspection.project_id)
            .first()
        )
        return result.inspection_count if result else 0

    @classmethod
    def create_inspection(cls, inspection_obj, session=None):
        """Persist inspection in database."""
        inspection = Inspection(**inspection_obj)
        if session:
            session.add(inspection)
            session.flush()
        else:
            inspection.save()
        return inspection

    @classmethod
    def get_by_ir_number(cls, ir_number):
        """Retrieve inspection by ir number."""
        return cls.query.filter_by(ir_number=ir_number, is_deleted=False).first()
