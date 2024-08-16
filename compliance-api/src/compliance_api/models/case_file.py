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

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer

from .base_model import BaseModel


class CaseFileInitiationEnum(enum.Enum):
    """Enum for CaseFileInitiation Options."""

    INSPECTION = "INSPECTION"
    COMPLAINT = "COMPLAINT"


CASE_FILE_INITIATION_MAP = {
    CaseFileInitiationEnum.INSPECTION: "Inspection",
    CaseFileInitiationEnum.COMPLAINT: "Complaint",
}


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
        nullable=False,
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
    )
    initiation = Column(
        Enum(CaseFileInitiationEnum),
        nullable=False,
        comment="Case file initiation options",
    )
    case_file_number = Column(
        Integer,
        unique=True,
        index=True,
        nullable=False,
        comment="The unique case file number",
    )


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
