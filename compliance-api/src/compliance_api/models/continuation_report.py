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
"""Continuation Report Model."""
import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class ContextTypeEnum(enum.Enum):
    """Continuation Report Context Type Enum."""

    INSPECTION = "Inspection"
    COMPLAINT = "Complaint"
    CASE_FILE = "Casefile"
    ORDER = "Order"


class ContinuationReport(BaseModelVersioned):
    """Continuation Report Model Class."""

    __tablename__ = "continuation_reports"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    case_file_id = Column(
        Integer,
        ForeignKey("case_files.id", name="inspections_case_file_id_case_file_id_fkey"),
        nullable=False,
        index=True,
        comment="The unique identifier of the case file associated with the inspection",
    )
    text = Column(String, comment="The plane text version of the string")
    rich_text = Column(String, comment="The html formatted version of the text")
    context_type = Column(
        Enum(ContextTypeEnum),
        nullable=False,
        comment="Indicates the context in which the entry is made",
    )
    context_id = Column(
        Integer,
        nullable=False,
        comment="The identifier of the entity referred by the context type",
    )
    system_generated = Column(
        Boolean,
        default=False,
        comment="To indicate if the entry is generated as part of the service invocation",
    )
    case_file = relationship("CaseFile", foreign_keys=[case_file_id], lazy="joined")

    @classmethod
    def create_entry(cls, report_entry_obj, session=None):
        """Persist continuation report entry in database."""
        report_entry = ContinuationReport(**report_entry_obj)
        if session:
            session.add(report_entry)
            session.flush()
        else:
            report_entry.save()
        return report_entry

    @classmethod
    def update_entry(cls, entry_id, report_entry_obj, session=None):
        """Update continuation report entry."""
        query = cls.query.filter_by(id=entry_id)
        report_entry: ContinuationReport = query.first()
        if not report_entry or report_entry.is_deleted:
            return None
        query.update(report_entry_obj)
        if session:
            session.flush()
        else:
            cls.session.commit()
        return report_entry

    @classmethod
    def delete_entry(cls, entry_id):
        """Delete a continuation report entry."""
        query = cls.query.filter_by(id=entry_id)
        report_entry: ContinuationReport = query.first()
        if not report_entry or report_entry.is_deleted:
            return None
        report_entry.is_deleted = True
        report_entry.update()


class ContinuationReportKey(BaseModelVersioned):
    """ContinationReportKey Model."""

    __tablename__ = "continuation_report_keys"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    report_id = Column(
        Integer,
        ForeignKey(
            "continuation_reports.id",
            name="continuation_report_keys_report_id_continuation_report_id_fkey",
        ),
        nullable=False,
        comment="The unique identifier of the report entry",
    )
    key = Column(
        String,
        nullable=False,
        comment="The key which is used to provide hyperlink to other entities",
    )
    key_context = Column(
        Enum(ContextTypeEnum),
        nullable=False,
        comment="The context of the key which is used to create hyperlinks using the key",
    )
