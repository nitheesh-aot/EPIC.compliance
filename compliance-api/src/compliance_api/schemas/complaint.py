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
"""Complaint Schema Schema."""
from marshmallow import EXCLUDE, fields, post_dump

from compliance_api.models import Complaint, ComplaintStatusEnum
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT, UNAPPROVED_PROJECT_CODE, UNAPPROVED_PROJECT_NAME

from .base_schema import AutoSchemaBase, BaseSchema


class ComplaintCreateSchema(BaseSchema):
    """Complaint schema for create."""

    project_id = fields.Int(
        metadata={
            "description": "The unique identifier for the project associated with the complaint."
        },
        allow_none=True,
    )
    concern_description = fields.Str(
        metadata={"description": "The concern description of the complaint."},
        required=True,
    )
    location_description = fields.Str(
        metadata={"description": "The location details of the complaint."},
        allow_none=True,
    )
    lead_officer_id = fields.Int(
        metadata={
            "description": "The unique identifier of the lead officer who created the complaint."
        },
        allow_none=True,
    )
    case_file_id = fields.Int(
        metadata={
            "description": "The unique identifier of the case file associated with the complaint."
        },
        required=True,
    )
    date_received = fields.DateTime(
        format=INPUT_DATE_TIME_FORMAT,
        metadata={"description": "The complaint received date in ISO 8601 format."},
        required=True,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
    )
    complaint_source_id = fields.Int(
        metadata={"description": "The unique identifier of complaint source"},
        required=True,
    )
    requirement_source_id = fields.Int(
        metadata={"description": "The unique identifier of requirement source"},
        required=True,
    )
    unapproved_project_description = fields.Str(
        metadata={"description": "The description of the unapproved projects"},
        allow_none=True,
    )
    unapproved_project_authorization = fields.Str(
        metadata={
            "description": "The authorization information of the unapproved project"
        },
        allow_none=True,
    )
    unapproved_project_regulated_party = fields.Str(
        metadata={"description": "The regulated_party name of the unapproved project"},
        allow_none=True,
    )
    unapproved_project_type = fields.Str(
        metadata={"description": "The type of the unapproved project"}, allow_none=True
    )
    unapproved_project_sub_type = fields.Str(
        metadata={"description": "The sub type of the unapproved project"},
        allow_none=True,
    )


class ComplaintSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for complaint model."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = Complaint
        include_fk = True

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the inspection status enum."""
        if "status" in data and data["status"] is not None:
            data["status"] = ComplaintStatusEnum(data["status"]).value
        else:
            data["inspection_status"] = ""
        if data.get("project", None) is None:
            data["project"] = {
                "name": UNAPPROVED_PROJECT_NAME,
                "abbreviation": UNAPPROVED_PROJECT_CODE,
            }
        return data
