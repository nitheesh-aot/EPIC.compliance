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
from marshmallow import EXCLUDE, fields, post_dump

from compliance_api.models import CaseFile, CaseFileOfficer, CaseFileStatusEnum
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT, UNAPPROVED_PROJECT_CODE, UNAPPROVED_PROJECT_NAME

from .base_schema import AutoSchemaBase, BaseSchema
from .common import KeyValueSchema
from .project import ProjectSchema
from .staff_user import StaffUserSchema


class CaseFileOfficerSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for CaseFileOfficer."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta for CaseFileOfficer Schema."""

        unknown = EXCLUDE
        model = CaseFileOfficer
        include_fk = True

    officer = fields.Nested(StaffUserSchema, dump_only=True)


class CaseFileSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Basic schema for case file."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = CaseFile
        include_fk = True

    lead_officer = fields.Nested(StaffUserSchema, dump_only=True)
    project = fields.Nested(
        ProjectSchema,
        dump_only=True,
        exclude=["is_active"],
    )
    initiation = fields.Nested(KeyValueSchema)

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the casefile status enum."""
        if "case_file_status" in data and data["case_file_status"] is not None:
            data["case_file_status"] = CaseFileStatusEnum(
                data["case_file_status"]
            ).value
        else:
            data["case_file_status"] = ""
        if data.get("project", None) is None:
            data["project"] = {
                "name": UNAPPROVED_PROJECT_NAME,
                "abbreviation": UNAPPROVED_PROJECT_CODE,
            }
        return data


class CaseFileCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """CaseFile create Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    project_id = fields.Int(
        metadata={
            "description": "The unique identifier for the project associated with the case file."
        },
        allow_none=True,
    )
    date_created = fields.DateTime(
        format=INPUT_DATE_TIME_FORMAT,
        metadata={"description": "The date on which the case file is created."},
        required=True,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
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
        metadata={
            "description": "The unique case file number. If not provided, the case file number will be auto generated."
        },
        allow_none=True,
    )
    officer_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifiers of the other officers associated with the case file"
            }
        )
    )


class CaseFileUpdateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """CaseFile create Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    lead_officer_id = fields.Int(
        metadata={"description": "The lead officer who created the case file."},
        allow_none=True,
    )
    officer_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifiers of the other officers associated with the case file"
            }
        )
    )
