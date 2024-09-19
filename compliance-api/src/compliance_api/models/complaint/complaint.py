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
"""Complaint Model."""
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class ComplaintStatusEnum(enum.Enum):
    """Inspection Status."""

    OPEN = "Open"
    CLOSED = "Closed"


class Complaint(BaseModel):
    """Complaint Model Class."""

    __tablename__ = "complaints"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the complaints",
    )

    case_file_id = Column(
        Integer,
        ForeignKey("case_files.id", name="complaints_case_file_id_case_file_id_fkey"),
        nullable=False,
        comment="The unique identifier of the case file associated with the complaint",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", name="complaints_project_id_projects_id_fkey"),
        nullable=True,
        comment="The unique identifier of the project associated with the complaint",
    )
    concern_description = Column(
        String, nullable=False, comment="The concern description of the complaint"
    )
    location_description = Column(
        String, nullable=True, comment="The location details of the complaint"
    )
    lead_officer_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="inspection_lead_officer_id_staff_id_fkey"),
        nullable=True,
        comment="The lead officer who created the inspection",
    )
    date_received = Column(
        DateTime(timezone=True),
        nullable=False,
        comment="The complaint received date",
    )
    requirement_source_id = Column(
        Integer,
        ForeignKey(
            "requirement_sources.id",
            name="requirement_source_id_requirement_sources_id",
        ),
        nullable=True,
        comment="The selected requirement source of the complaint",
    )
    source_type_id = Column(
        Integer,
        ForeignKey(
            "complaint_sources.id", name="complaints_source_id_complaint_sources_id"
        ),
        nullable=False,
        comment="The selected source of the complaint",
    )
    source_agency_id = Column(
        Integer,
        ForeignKey(
            "agencies.id", name="complaints_agency_id_agencies_id",
        ),
        nullable=True,
        comment="The unique Id of the agency if the complaint source is selected as agency"
    )
    source_first_nation_id = Column(
        Integer,
        nullable=True,
        comment="The unique Id of the first nation if the complaint source is selected as first nation"
    )
    status = Column(Enum(ComplaintStatusEnum), nullable=False)
    case_file = relationship("CaseFile", foreign_keys=[case_file_id], lazy="joined")
    requirement_source = relationship(
        "RequirementSource", foreign_keys=[requirement_source_id], lazy="joined"
    )
    source = relationship("ComplaintSource", foreign_keys=[source_type_id], lazy="joined")
    agency = relationship("Agency", foreign_keys=[source_agency_id], lazy="joined")

    # @classmethod
    # def get_count_by_project_nd_case_file_id(cls, project_id: int, case_file_id: int):
    #     """Return the number of inspection based on the project and case file id."""
    #     result = (
    #         cls.query.with_entities(
    #             Inspection.case_file_id,
    #             Inspection.project_id,
    #             func.count(Inspection.id).label(  # pylint: disable=not-callable
    #                 "inspection_count"
    #             ),
    #         )
    #         .filter_by(project_id=project_id, case_file_id=case_file_id)
    #         .group_by(Inspection.case_file_id, Inspection.project_id)
    #         .first()
    #     )
    #     return result.inspection_count if result else 0

    # @classmethod
    # def create_inspection(cls, inspection_obj, session=None):
    #     """Persist inspection in database."""
    #     inspection = Inspection(**inspection_obj)
    #     if session:
    #         session.add(inspection)
    #         session.flush()
    #     else:
    #         inspection.save()
    #     return inspection
