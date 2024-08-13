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
"""Schema for user representation from epic.authorize."""
from marshmallow import EXCLUDE, Schema, fields


class AuthUserSchema(Schema):
    """Schema for the auth user."""

    class Meta:
        """Meta for AuthUserSchema."""

        unknown = EXCLUDE

    first_name = fields.Str(
        metadata={"description": "The first name of the user"}, required=True
    )
    last_name = fields.Str(
        metadata={"description": "The lastname of the user"}, required=True
    )
    id = fields.Str(
        data_key="username",
        metadata={"description": "The unique id of the user"},
        required=True,
    )
