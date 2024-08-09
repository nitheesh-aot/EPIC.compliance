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
from marshmallow import EXCLUDE, Schema, fields
from marshmallow_enum import EnumField

from compliance_api.models.agency import Agency

from .common import KeyValueSchema


class AgencySchema(Schema):
    """Agency schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE
        model = Agency
        include_fk = True

    id = fields.Int(
        metadata={"description": "The unique identifier of the staff user."}
    )
    first_name = fields.Str(
        metadata={"description": "The firstname of the staff user."}
    )
    last_name = fields.Str(metadata={"description": "The lastname of the staff user."})
    position_id = fields.Int(
        metadata={
            "description": "The unique identifier of the position of the staff user."
        }
    )
    position = fields.Nested(
        KeyValueSchema, dump_only=True
    )
    deputy_director_id = fields.Int(
        metadata={"description": "The unique identifier of the deputy director."}
    )
    supervisor_id = fields.Int(
        metadata={"description": "The unique identifier of the supervisor."}
    )
    auth_user_id = fields.Str(
        metadata={"description": "The unique identifier from the identity provider."}
    )
    full_name = fields.Str(
        metadata={"description": "Fullname of the staff user"}
    )
    # permission = fields.Method("get_user_permission", required=True)

    def get_user_permission(self, staff_user: StaffUser):  # pylint: disable=no-self-use
        """Extract the permission value from the enum."""
        permission_value = PERMISSION_MAP[staff_user.permission]
        return permission_value


class StaffUserCreateSchema(Schema):
    """User Request Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    position_id = fields.Int(
        metadata={
            "description": "The unique identifier of the position of the staff user."
        },
        required=True,
    )
    deputy_director_id = fields.Int(
        metadata={"description": "The unique identifier of the deputy director."}
    )
    supervisor_id = fields.Int(
        metadata={"description": "The unique identifier of the supervisor."}
    )
    auth_user_id = fields.Str(
        metadata={"description": "The unique identifier from the identity provider."},
        required=True,
    )
    permission = EnumField(
        PermissionEnum,
        metadata={"description": "The permission level of the staff user."},
        by_value=True,
        required=True,
    )
