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
from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.enum import ContextEnum

from .base_model import BaseModelVersioned


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
        Enum(ContextEnum),
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
        index=True,
        nullable=False,
        comment="The unique identifier of the report entry",
    )
    key = Column(
        String,
        nullable=False,
        comment="The key which is used to provide hyperlink to other entities",
    )
    key_context = Column(
        Enum(ContextEnum),
        nullable=False,
        comment="The context of the key which is used to create hyperlinks using the key",
    )

    @classmethod
    def get_by_report_id(cls, report_id: int):
        """Get keys by report id."""
        return cls.query.filter_by(report_id=report_id, is_deleted=False).all()

    @classmethod
    def bulk_delete(cls, report_id, keys, session=None):
        """Delete continuation report keys."""
        query = session.query(ContinuationReportKey) if session else cls.query
        query.filter(cls.report_id == report_id, cls.key.in_(keys)).update(
            {cls.is_active: False, cls.is_deleted: True}
        )

    @classmethod
    def bulk_insert(cls, report_id: int, keys: list[int], session=None):
        """Insert keys for the continuation report."""
        key_data = [
            ContinuationReportKey(
                **{
                    "report_id": report_id,
                    "key": key.get("key"),
                    "key_context": key.get("key_context"),
                }
            )
            for key in keys
        ]
        if session:
            session.add_all(key_data)
            session.flush()
        else:
            cls.session.add_all(key_data)
            cls.session.commit()
