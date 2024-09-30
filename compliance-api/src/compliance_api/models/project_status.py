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
"""Project Status Model."""
from sqlalchemy import Column, Integer, String

from .base_model import BaseModelVersioned


class ProjectStatusOption(BaseModelVersioned):
    """ProjectStatus options."""

    __tablename__ = "project_status_options"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the project status option",
    )
    name = Column(String, unique=True, comment="The name of the option")
    sort_order = Column(
        Integer,
        comment="Order of priority. Mainly used order the options while listing",
    )
