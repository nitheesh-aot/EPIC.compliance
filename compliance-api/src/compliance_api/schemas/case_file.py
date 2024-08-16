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

from compliance_api.models import CaseFile, CaseFileInitiationEnum

from .base_schema import AutoSchemaBase, BaseSchema
from .staff_user import StaffUserSchema
from .common import KeyValueSchema


class CaseFileSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Basic schema for staff user."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = CaseFile
        include_fk = True

    lead_officer = fields.Nested(StaffUserSchema, dump_only=True)


class CaseFileCreateSchema(BaseSchema):
    """CaseFile create Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    project_id = fields.Int(
        metadata={
            "description": "The unique identifier for the project associated with the case file."
        },
        required=True,
    )
    date_created = fields.DateTime(
        metadata={"description": "The date on which the case file is created."},
        required=True,
    )
    lead_officer_id = fields.Int(
        metadata={"description": "The lead officer who created the case file."},
        allow_none=True,
    )
    initiation = EnumField(
        CaseFileInitiationEnum,
        metadata={"description": "The case file initiation options."},
        by_value=True,
        required=True,
    )
    case_file_number = fields.Int(
        metadata={"description": "The unique case file number"}, required=True
    )
    officer_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifiers of the other officers associated with the case file"
            }
        )
    )

    @post_load
    def extract_permission_value(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the permission enum."""
        initiation_enum = data.get("initiation")
        if initiation_enum:
            data["initiation"] = initiation_enum.value
        return data
