"""Schema for the inspection requirements grid."""

from marshmallow import Schema, fields

from .base_schema import BaseSchema
from .common import KeyValueSchema
from .staff_user import StaffUserSchema


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
        metadata={"description": "The approval status of the inspection requirement"},
    )
    approved_by_id = fields.Int(
        metadata={"description": "The ID of the approved by"}
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
    primary_officer = fields.Nested(
        StaffUserSchema,
        metadata={
            "description": "The primary officer name of the inspection requirement"
        },
    )
    project = fields.Nested(
        KeyValueSchema,
        metadata={"description": "The project name of the inspection requirement"},
    )


class InspectionRequirementFilterSchema(BaseSchema):
    """Schema to filter the inspection requirements."""

    tpc_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of topic ids of the inspection requirement"},
    )
    summary = fields.String(
        required=False, metadata={"description": "The summary of the inspection requirement"}
    )
    cmd_fnd_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of compliance finding ids of the inspection requirement"},
    )
    enf_actn_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of enforcement action ids of the inspection requirement"},
    )
    apprv_sts = fields.String(
        required=False,
        metadata={"description": "The comma separated list of approval status ids of the inspection requirement"},
    )
    req_src_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of requirement source ids of the inspection requirement"},
    )
    req_src_num = fields.String(
        required=False,
        metadata={"description": "The requirement source number of the inspection requirement"},
    )
    ir_no = fields.String(
        required=False, metadata={"description": "The inspection requirement number"}
    )
    date_issued = fields.String(
        required=False, metadata={"description": "The date the inspection requirement was issued"}
    )
    prm_offc_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of primary officer ids of the inspection requirement"},
    )
    insp_sts = fields.String(
        required=False,
        metadata={"description": "The inspection status of the inspection requirement"},
    )
    project_ids = fields.String(
        required=False,
        metadata={"description": "The comma separated list of project ids of the inspection requirement"},
    )
