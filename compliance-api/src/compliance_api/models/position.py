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
"""Position Model."""
from sqlalchemy import Column

from .base_model import BaseModelVersioned
from .db import db


class Position(BaseModelVersioned):
    """Definition of Position Entity."""

    __tablename__ = "positions"
    id = Column(db.Integer, primary_key=True, autoincrement=True)
    name = Column(db.String(100), nullable=True)
    description = Column(db.String(500), nullable=True)
