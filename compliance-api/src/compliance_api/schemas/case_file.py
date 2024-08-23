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
from marshmallow import EXCLUDE, fields

from compliance_api.models import CaseFile, CaseFileOfficer

from .base_schema import AutoSchemaBase, BaseSchema
from .project import ProjectSchema
from .staff_user import StaffUserSchema


class CaseFileOfficerSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for CaseFileOfficer."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta for CaseFileOfficer Schema."""

        unknown = EXCLUDE
        model = CaseFileOfficer
        include_fk = True


class CaseFileSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Basic schema for staff user."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = CaseFile
        include_fk = True

    lead_officer = fields.Nested(StaffUserSchema, dump_only=True)
    project = fields.Nested(
        ProjectSchema,
        dump_only=True,
        exclude=["description", "ea_certificate", "proponent_name", "is_active"],
    )


class CaseFileCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
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
    initiation_id = fields.Int(
        metadata={"description": "The unique identifier for the initiation options"},
        required=True,
    )
    case_file_number = fields.Str(
        metadata={"description": "The unique case file number"}, required=True
    )
    officer_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifiers of the other officers associated with the case file"
            }
        )
    )
