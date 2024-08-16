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
"""CaseFile Schema."""
from marshmallow import EXCLUDE, fields, post_dump, post_load
from marshmallow_enum import EnumField

from compliance_api.models.staff_user import PermissionEnum, StaffUser

from .base_schema import AutoSchemaBase, BaseSchema
from .common import KeyValueSchema


class CaseFileSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Basic schema for staff user."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = StaffUser
        include_fk = True

    position = fields.Nested(KeyValueSchema, dump_only=True)
    permission = fields.Str(
        metadata={"description": "The permission level of the user in the app"}
    )
    full_name = fields.Method("get_full_name")

    def get_full_name(self, obj):  # pylint: disable=no-self-use
        """Derive fullname."""
        return f"{obj.first_name} {obj.last_name}" if obj else ""

    @post_dump
    def nullify_nested(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Make nested objects null if the referenced ID is null."""
        if data.get("deputy_director_id") is None:
            data["deputy_director"] = None
        if data.get("supervisor_id") is None:
            data["supervisor"] = None
        return data


class StaffUserSchema(StaffUserSchemaSkeleton):  # pylint: disable=too-many-ancestors
    """Staff User schema."""

    deputy_director = fields.Nested(StaffUserSchemaSkeleton, dump_only=True)
    supervisor = fields.Nested(StaffUserSchemaSkeleton, dump_only=True)


class StaffUserCreateSchema(BaseSchema):
    """User create Schema."""

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
        metadata={"description": "The unique identifier of the deputy director."},
        allow_none=True,
    )
    supervisor_id = fields.Int(
        metadata={"description": "The unique identifier of the supervisor."},
        allow_none=True,
    )
    auth_user_guid = fields.Str(
        metadata={"description": "The unique identifier from the identity provider."},
        required=True,
    )
    permission = EnumField(
        PermissionEnum,
        metadata={"description": "The permission level of the staff user."},
        by_value=True,
        required=True,
    )

    @post_load
    def extract_permission_value(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the permission enum."""
        permission_enum = data.get("permission")
        if permission_enum:
            data["permission"] = permission_enum.value
        return data
