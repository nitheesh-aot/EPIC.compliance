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
"""Super class to handle all operations related to base model."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String

from .db import db


class BaseModel(db.Model):
    """This class manages all of the base model functions."""

    __abstract__ = True

    created_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_date = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True
    )
    created_by = Column(String(100), nullable=False)
    updated_by = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, server_default="t", nullable=False)
    is_deleted = Column(Boolean, default=False, server_default="f", nullable=False)

    @classmethod
    def get_all(cls):
        """Fetch list of users by access type."""
        return cls.query.all()

    @classmethod
    def find_by_id(cls, identifier: int):
        """Return model by id."""
        return cls.query.get(identifier)

    @staticmethod
    def commit():
        """Commit the session."""
        db.session.commit()

    def flush(self):
        """Save and flush."""
        db.session.add(self)
        db.session.flush()
        return self

    def add_to_session(self):
        """Save and flush."""
        return self.flush()

    def save(self):
        """Save and commit."""
        db.session.add(self)
        db.session.flush()
        db.session.commit()

    def update(self, payload: dict, commit=True):
        """Update and commit."""
        for key, value in payload.items():
            if key != "id":
                setattr(self, key, value)
        if commit:
            self.commit()

    def delete(self):
        """Delete and commit."""
        db.session.delete(self)
        db.session.flush()
        db.session.commit()

    @staticmethod
    def rollback():
        """RollBack."""
        db.session.rollback()
