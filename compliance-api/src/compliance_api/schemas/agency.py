# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Agency Schema."""
from marshmallow import EXCLUDE, Schema, fields, pre_load

from compliance_api.models.agency import Agency

from .base_schema import AutoSchemaBase


class AgencySchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Agency schema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE
        model = Agency
        include_fk = True


class AgencyCreateSchema(Schema):  # pylint: disable=too-many-ancestors
    """Agency create Schema."""

    name = fields.Str(metadata={"description": "The name of the agency"})
    abbreviation = fields.Str(metadata={"description": "The "})

    @pre_load
    def uppercase_abbreviation(self, data, **kwargs):  # pylint: disable=no-self-use, unused-argument
        """Convert the abbreviation to uppercase before loading."""
        if "abbreviation" in data and data["abbreviation"]:
            data["abbreviation"] = data["abbreviation"].upper()
        return data
