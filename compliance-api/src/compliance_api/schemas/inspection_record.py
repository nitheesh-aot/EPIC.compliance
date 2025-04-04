"""Schema for Inspection Record."""

from marshmallow import EXCLUDE, ValidationError, fields, post_dump, post_load, validate
from marshmallow_enum import EnumField

from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.inspection_record import IRProgressEnum, IRStatusEnum
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT

from .base_schema import AutoSchemaBase, BaseSchema
from .common import KeyValueSchema
from .inspection import InspectionSchema
from .appendix import AppendixSchema
from .department_detail import DepartmentDetailsSchema


class InspectionRecordCreateSchema(BaseSchema):
    """Inspection Record Create Schema."""

    ir_status = EnumField(
        IRStatusEnum,
        metadata={"description": "The status of the IR to be generated"},
        required=True,
        by_value=True,
    )


class InspectionRecordSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """InspectionRecordSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionRecordModel
        include_fk = True

    inspection = fields.Nested(InspectionSchema)
    ir_status = fields.Nested(KeyValueSchema)

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the inspection record status enum."""
        if "ir_progress" in data and data["ir_progress"] is not None:
            data["ir_progress"] = IRProgressEnum(data["ir_progress"]).value
        else:
            data["ir_progress"] = ""
        return data


class UpdateInspectionRecordSchema(BaseSchema):
    """Schema for updating selected fields of an InspectionRecord."""

    field_name = fields.Str(required=True, validate=validate.Length(min=1))
    value = fields.Raw(required=True)  # Allows various types of input

    @post_load
    def validate_fields(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Perform custom validation for allowed fields."""
        allowed_fields = {
            "mailing_address": fields.Str(validate=validate.Length(max=255)),
            "inspection_scope": fields.Str(),
            "preliminary_review_details": fields.Str(),
            "finding_statement": fields.Str(),
            "enforcement_summary": fields.Str(),
            "action_required_by_rp": fields.Str(),
            "date_issued": fields.DateTime(
                format=INPUT_DATE_TIME_FORMAT,
                metadata={
                    "description": "Inspection record issued date in ISO 8601 format."
                },
                required=True,
                error_messages={
                    "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
                },
            ),
        }

        field_name = data["field_name"]
        if field_name not in allowed_fields:
            raise ValidationError(f"Invalid field: {field_name}")

        return data


class ResetInspectionRecordFieldSchema(BaseSchema):
    """Schema for resetting a field in InspectionRecord."""

    field_name = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["inspection_scope", "preliminary_review_details", "finding_statement"]
        ),
        metadata={"description": "The field to reset"},
    )


class ProjectDetailsSchema(BaseSchema):
    """Schema for project details."""

    name = fields.Str(required=True)
    eac_certificate = fields.Str(required=True)
    project_state = fields.Str(required=True)
    proponent_label = fields.Str(required=True)
    proponent = fields.Str(required=True)


class InspectionDetailsSchema(BaseSchema):
    """Schema for inspection details."""

    id = fields.Int(required=True)
    inspection_type = fields.Str(required=True)
    start_date = fields.Str(required=True)
    utm = fields.Str(required=True)
    project_description = fields.Str(required=True)
    location_description = fields.Str(required=True)
    initiation = fields.Str(required=True)


class InspectionRecordPreviewSchema(BaseSchema):
    """Schema for previewing an InspectionRecord."""

    project_details = fields.Nested(ProjectDetailsSchema)
    inspection_details = fields.Nested(InspectionDetailsSchema)
    inspection_scope = fields.Str(required=True)
    officer_details = fields.Raw()
    appendices = fields.List(fields.Nested(AppendixSchema))
    department_details = fields.Nested(DepartmentDetailsSchema)
    preliminary_review_details = fields.Str(required=True)
    finding_statement = fields.Str(required=True)
    enforcement_summary = fields.Str(required=True)
    ir_status = fields.Str(required=True)
    action_required_by_rp = fields.Str(required=True)
    ir_number = fields.Str(required=True)
