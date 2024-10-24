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
"""Inspection Schema Schema."""
from marshmallow import EXCLUDE, ValidationError, fields, post_dump, validates_schema

from compliance_api.models.inspection import (
    Inspection, InspectionAttendance, InspectionAttendanceOptionEnum, InspectionOfficer, InspectionStatusEnum)
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT, UNAPPROVED_PROJECT_CODE, UNAPPROVED_PROJECT_NAME

from .base_schema import AutoSchemaBase, BaseSchema
from .case_file import CaseFileSchema
from .common import KeyValueSchema
from .staff_user import StaffUserSchema


class InspectionAttendanceSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """InspectionAttendanceSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionAttendance
        include_fk = True

    data = fields.Raw()
    attendance_option = fields.Nested(KeyValueSchema)

    @post_dump
    def preprocess_data(
        self, data, **kwargs
    ):  # pylint: disable=unused-argument, no-self-use
        """Pre-process the 'data' field to handle single text value or list of key-value pairs."""
        if isinstance(data.get("data", None), str):
            data["data"] = data.get("data")
        return data


class InspectionOfficerSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """InspectionOfficerSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionOfficer
        include_fk = True

    officer = fields.Nested(StaffUserSchema, dump_only=True)


class InspectionUpdateSchema(BaseSchema):
    """InspectionUpdateSchema."""

    project_description = fields.Str(
        metadata={"description": "The project description"}, allow_none=True
    )
    location_description = fields.Str(
        metadata={"description": "The location details of the inspection."},
        allow_none=True,
    )
    utm = fields.Str(
        metadata={"description": "The UTM value of the location."}, allow_none=True
    )
    primary_officer_id = fields.Int(
        metadata={
            "description": "The unique identifier of the primary officer who created the inspection."
        },
        required=True,
    )
    initiation_id = fields.Int(
        metadata={
            "description": "The unique identifier of the initiation option for creating the inspection."
        },
        required=True,
    )
    inspection_type_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifier of the inspection type options"
            }
        ),
        required=True,
    )
    start_date = fields.DateTime(
        format=INPUT_DATE_TIME_FORMAT,
        metadata={"description": "The inspection start date in ISO 8601 format."},
        required=True,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
    )
    end_date = fields.DateTime(
        format=INPUT_DATE_TIME_FORMAT,
        metadata={"description": "The inspection end date in ISO 8601 format."},
        required=True,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
    )
    ir_status_id = fields.Int(
        metadata={
            "description": "The unique identifier of the inspection record status."
        },
        allow_none=True,
    )
    project_status_id = fields.Int(
        metadata={"description": "The unique identifier of the project status."},
        allow_none=True,
    )
    attendance_option_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifier of the inspection attendance options"
            }
        ),
        required=False,
    )
    agency_attendance_ids = fields.List(
        fields.Int(
            metadata={"description": "The list of unique identifier of the agencies"}
        ),
        required=False,
    )
    attending_officer_ids = fields.List(
        fields.Int(
            metadata={"description": "The list of unique identifier of the officers"}
        ),
        required=False
    )
    attendance_municipal = fields.Str(
        metadata={"description": "The municipal attendance"}, allow_none=True
    )
    attendance_other = fields.Str(
        metadata={"description": "Other attendance"}, allow_none=True
    )
    firstnation_attendance_ids = fields.List(
        fields.Int(
            metadata={
                "description": "The list of unique identifier of the firstnations"
            }
        ),
        required=False,
    )

    @validates_schema
    def validate_attendance_other(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that the other attendance info is entered is OTHER is chosen as attendance option."""
        value = data.get("attendance_option_ids", [])
        attendance_other = data.get("attendance_other", None)
        other_in_option = InspectionAttendanceOptionEnum.OTHER.value in value
        if not attendance_other and other_in_option:
            raise ValidationError(
                "Other attendance is required as OTHER is chosen in attendance",
                field_name="attendance_other",
            )

    @validates_schema
    def validate_attendance_municipal(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that the municipal attendance info is entered is MUNICIPAL is chosen as attendance option."""
        value = data.get("attendance_option_ids", [])
        attendance_municipal = data.get("attendance_municipal", None)
        municipal_in_option = InspectionAttendanceOptionEnum.MUNICIPAL.value in value
        if not attendance_municipal and municipal_in_option:
            raise ValidationError(
                "Municipal attendance is required as MUNICIPAL is chosen in attendance",
                field_name="attendance_municipal",
            )

    @validates_schema
    def validate_dates(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that end_date is after start_date."""
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and start_date > end_date:
            raise ValidationError(
                "End date must be after start date.", field_name="end_date"
            )

    @validates_schema
    def validate_attendance_option_ids(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that all attendance option IDs are valid."""
        valid_values = {member.value for member in InspectionAttendanceOptionEnum}
        value = data.get("attendance_option_ids", [])
        if not isinstance(value, list):
            raise ValidationError("attendance_option_ids must be a list.")
        # Check if AGENCIES is included and validate the conditions
        agencies_in_option = InspectionAttendanceOptionEnum.AGENCIES.value in value
        firstnations_in_option = (
            InspectionAttendanceOptionEnum.FIRSTNATIONS.value in value
        )
        attending_officers_in_option = (
            InspectionAttendanceOptionEnum.ATTENDING_OFFICERS.value in value
        )
        invalid_ids = [item for item in value if item not in valid_values]
        if invalid_ids:
            raise ValidationError(
                f"Invalid attendance option IDs: {', '.join(map(str, invalid_ids))}",
                field_name="attendance_option_ids",
            )
        # Conditional check: Ensure agency_attendance_ids is only included if AGENCIES is in attendance_option_ids
        if data.get("agency_attendance_ids") and not agencies_in_option:
            raise ValidationError(
                "If agency_attendance_ids are provided, AGENCIES must be included in attendance_option_ids.",
                field_name="attendance_option_ids",
            )
        if data.get("firstnation_attendance_ids") and not firstnations_in_option:
            raise ValidationError(
                "If firstnation_attendance_ids are provided, 'FIRSTNATIONS' must be included in "
                "the attendance_option_ids.",
                field_name="attendance_option_ids",
            )
        if data.get("attending_officer_ids") and not attending_officers_in_option:
            raise ValidationError(
                "If attending_officer_ids are provided, 'ATTENDING_OFFICER' must be included in "
                "the attendance_option_ids.",
                field_name="attendance_option_ids",
            )

    @validates_schema
    def validate_agency_attendance_ids(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that agency_attendance_ids is valid if required."""
        # Retrieve the context to access other fields
        attendance_option_ids = data.get("attendance_option_ids", [])
        value = data.get("agency_attendance_ids", None)
        if InspectionAttendanceOptionEnum.AGENCIES.value in attendance_option_ids:
            if not value:
                raise ValidationError(
                    "agency_attendance_ids are required when agencies are included in attendance_option_ids.",
                    field_name="agency_attendance_ids",
                )

    @validates_schema
    def validate_officer_attendance_ids(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that attending_officer_ids is valid if required."""
        # Retrieve the context to access other fields
        attendance_option_ids = data.get("attendance_option_ids", [])
        value = data.get("attending_officer_ids", None)
        if InspectionAttendanceOptionEnum.ATTENDING_OFFICERS.value in attendance_option_ids:
            if not value:
                raise ValidationError(
                    "attending_officer_ids are required when ATTENDING_OFFICERS are included in attendance_option_ids.",
                    field_name="agency_attendance_ids",
                )

    @validates_schema
    def validate_firstnation_attendance_ids(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure that firstnation_attendance_ids is valid if required."""
        # Retrieve the context to access other fields
        attendance_option_ids = data.get("attendance_option_ids", [])
        value = data.get("firstnation_attendance_ids", None)

        if InspectionAttendanceOptionEnum.FIRSTNATIONS.value in attendance_option_ids:
            if not value:
                raise ValidationError(
                    "firstnation_attendance_ids is required when agencies are included in attendance_option_ids.",
                    field_name="firstnation_attendance_ids",
                )


class InspectionCreateSchema(InspectionUpdateSchema):
    """Inspection schema for create."""

    project_id = fields.Int(
        metadata={
            "description": "The unique identifier for the project associated with the inspection."
        },
        allow_none=True,
    )
    case_file_id = fields.Int(
        metadata={
            "description": "The unique identifier of the case file associated with the inspection."
        },
        required=True,
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


class InspectionSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for inspection model."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = Inspection
        include_fk = True

    case_file = fields.Nested(CaseFileSchema, only=("case_file_number", "id"))
    primary_officer = fields.Nested(
        StaffUserSchema, only=("id", "first_name", "last_name", "full_name")
    )
    project = fields.Nested(
        KeyValueSchema,
    )
    ir_status = fields.Nested(KeyValueSchema)
    initiation = fields.Nested(KeyValueSchema)
    types = fields.Method("get_inspection_types")
    types_text = fields.Method("get_inspection_type_names")
    authorization = fields.Str(
        metadata={"description": "The authorization information of the project"}
    )
    regulated_party = fields.Str(
        metadata={"description": "The regulated party of the project"}
    )
    type = fields.Str(metadata={"description": "The type of the project"})
    sub_type = fields.Str(metadata={"description": "The subtype of the project"})
    project_status = fields.Nested(KeyValueSchema)

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the inspection status enum."""
        if "inspection_status" in data and data["inspection_status"] is not None:
            data["inspection_status"] = InspectionStatusEnum(
                data["inspection_status"]
            ).value
        else:
            data["inspection_status"] = ""
        if data.get("project", None) is None:
            data["project"] = {
                "name": UNAPPROVED_PROJECT_NAME,
                "abbreviation": UNAPPROVED_PROJECT_CODE,
            }
        return data

    def get_inspection_types(
        self, obj
    ):  # pylint: disable=no-self-use, unused-argument
        """Get the inspection type objects."""
        if obj.types:
            return [{"id": o.type.id, "name": o.type.name} for o in obj.types]
        return []

    def get_inspection_type_names(
        self, obj
    ):  # pylint: disable=no-self-use, unused-argument
        """Get the inspection type names as comma seprated list."""
        if obj.types:
            return ", ".join([o.type.name for o in obj.types])
        return []
