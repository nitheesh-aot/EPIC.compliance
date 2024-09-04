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
"""Inspection Officer Model."""
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class InspectionOfficer(BaseModel):
    """Other officers associated with the inspection."""

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
        "Inspection",
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
