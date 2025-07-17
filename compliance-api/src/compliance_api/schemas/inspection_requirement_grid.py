"""Schema for the inspection requirements grid."""

from marshmallow import Schema, fields

from .common import KeyValueSchema


class InspectionRequirementGridItemSchema(Schema):
    """Schema for a single item in the inspection requirements grid."""

    id = fields.Int(metadata={"description": "The ID of the inspection requirement"})
    topic = fields.Nested(
        KeyValueSchema,
        metadata={"description": "The topic of the inspection requirement"},
    )
    summary = fields.Str(
        metadata={"description": "The summary of the inspection requirement"}
    )
    compliance_finding = fields.Nested(
        KeyValueSchema,
        metadata={
            "description": "The compliance finding of the inspection requirement"
        },
    )
    enforcement_action = fields.Nested(
        KeyValueSchema,
        metadata={
            "description": "The enforcement action of the inspection requirement"
        },
    )
    approval_status = fields.Nested(
        KeyValueSchema,
        metadata={"description": "The approval status of the inspection requirement"}
    )
    sort_order = fields.Int(
        metadata={"description": "The sort order of the inspection requirement"}
    )
    date_issued = fields.Str(
        metadata={"description": "The date the inspection requirement was issued"}
    )
    ir_number = fields.Str(
        metadata={"description": "The inspection requirement number"}
    )
    requirement_number = fields.Str(metadata={"description": "The requirement number"})
    requirement_source = fields.Nested(
        KeyValueSchema, metadata={"description": "The requirement source"}
    )
    inspection_status = fields.Nested(
        KeyValueSchema, metadata={"description": "The inspection status"}
    )
    primary_officer_name = fields.Str(
        metadata={
            "description": "The primary officer name of the inspection requirement"
        }
    )
    project_name = fields.Str(
        metadata={"description": "The project name of the inspection requirement"}
    )
