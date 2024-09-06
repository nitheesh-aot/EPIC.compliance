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
"""Case file Model."""
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, cast, func
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class CaseFileInitiationEnum(enum.Enum):
    """Enum for case file initiation."""

    INSPECTION = 1
    COMPLIANT = 2


class CaseFileStatusEnum(enum.Enum):
    """Casefile Status."""

    OPEN = "Open"
    CLOSED = "Closed"


class CaseFile(BaseModel):
    """Definition of CaseFile Entity."""

    __tablename__ = "case_files"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the case file",
    )
    project_id = Column(
        Integer,
        ForeignKey("projects.id", name="case_files_project_id_projects_id_fkey"),
        nullable=True,
        comment="The unique identifier of the project associated with the case file",
    )
    date_created = Column(
        DateTime(timezone=True),
        nullable=False,
        comment="The date on which the case file is created",
    )
    lead_officer_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="case_files_created_staff_id_fkey"),
        nullable=True,
        comment="The lead officer who created the case file",
    )
    initiation_id = Column(
        Integer,
        ForeignKey(
            "case_file_initiation_options.id",
            name="case_files_initation_id_case_file_initiation_options_id_fkey",
        ),
        nullable=False,
        comment="Case file initiation options",
    )
    case_file_number = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
        comment="The unique case file number",
    )
    case_file_status = Column(Enum(CaseFileStatusEnum), nullable=True)

    lead_officer = relationship(
        "StaffUser", foreign_keys=[lead_officer_id], lazy="joined"
    )
    project = relationship("Project", foreign_keys=[project_id], lazy="joined")
    case_file_officers = relationship(
        "CaseFileOfficer",
        back_populates="case_file",
        lazy="select",
    )
    initiation = relationship(
        "CaseFileInitiationOption", foreign_keys=[initiation_id], lazy="joined"
    )

    @classmethod
    def create_case_file(cls, case_file_data, session=None):
        """Persist case file data in database."""
        case_file = CaseFile(**case_file_data)
        if session:
            session.add(case_file)
            session.flush()
        else:
            case_file.save()
        return case_file

    @classmethod
    def update_case_file(cls, case_file_id, case_file_data, session=None):
        """Update the case file data in database."""
        query = cls.query.filter_by(id=case_file_id)
        case_file: CaseFile = query.first()
        if not case_file or case_file.is_deleted:
            return None
        query.update(case_file_data)
        if session:
            session.flush()
        else:
            cls.session.commit()
        return case_file

    @classmethod
    def get_by_file_number(cls, case_file_number):
        """Retrieve case file information based on given case file number."""
        return cls.query.filter_by(
            case_file_number=case_file_number, is_deleted=False
        ).first()

    @classmethod
    def get_by_project(cls, project_id: int):
        """Retrieve case files by project."""
        return cls.query.filter_by(project_id=project_id).all()

    @classmethod
    def get_max_case_file_number_by_year(cls, year: int):
        """Get the max case file number generated so far."""
        max_number = (
            cls.query.with_entities(
                func.max(  # pylint: disable=not-callable
                    cast(
                        func.regexp_replace(cls.case_file_number, "[^0-9]", "", "g"),
                        Integer,
                    )
                ).label("max_number")
            )
            .filter(
                func.regexp_replace(  # pylint: disable=not-callable
                    cls.case_file_number, "[^0-9]", "", "g"
                ).op("~")(f"^{year}[0-9]+$")
            )
            .scalar()
        )
        return max_number if max_number is not None else 0


class CaseFileOfficer(BaseModel):
    """Other officers associated with the Casefile."""

    __tablename__ = "case_file_officers"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the case file officers",
    )
    case_file_id = Column(
        Integer,
        ForeignKey("case_files.id", name="case_file_officers_case_files_id_fkey"),
        nullable=False,
        comment="The unique identifier of the associated case file",
    )
    officer_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="case_file_officers_staff_users_id_fkey"),
        nullable=False,
        comment="The unique identifier of the associated staff user",
    )

    case_file = relationship(
        "CaseFile",
        back_populates="case_file_officers",
        lazy="joined",
    )
    officer = relationship("StaffUser", foreign_keys=[officer_id], lazy="joined")

    @classmethod
    def get_all_by_case_file_id(cls, case_file_id: int):
        """Retrieve all case file officers by case file id."""
        return cls.query.filter_by(case_file_id=case_file_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(cls, case_file_id: int, officer_ids: list[int], session=None):
        """Delete officer ids by id per case file."""
        query = session.query(CaseFileOfficer) if session else cls.query
        query.filter(
            cls.case_file_id == case_file_id, cls.officer_id.in_(officer_ids)
        ).update({cls.is_active: False, cls.is_deleted: True})

    @classmethod
    def bulk_insert(cls, case_file_id: int, officer_ids: list[int], session=None):
        """Insert officers per case file."""
        case_file_officer_data = [
            CaseFileOfficer(**{"case_file_id": case_file_id, "officer_id": officer_id})
            for officer_id in officer_ids
        ]
        if session:
            session.add_all(case_file_officer_data)
            session.flush()
        else:
            cls.session.add_all(case_file_officer_data)
            cls.session.commit()


class CaseFileInitiationOption(BaseModel):
    """Initiation Options for creating CaseFile."""

    __tablename__ = "case_file_initiation_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the case file initiation options",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )
