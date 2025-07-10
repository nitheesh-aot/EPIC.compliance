"""Schema for the inspection requirements grid."""

from marshmallow import fields
from .paginate import PaginationParameterSchema


class InspectionRequirementGridSchema(PaginationParameterSchema):
    """Schema for the inspection requirements grid."""

    topic = fields.Str(dump_default=None)
    requirement_summary = fields.Str(dump_default=None)
    compliance_finding = fields.Str(dump_default=None)
    enforcement_action = fields.Str(dump_default=None)
    approval_status = fields.Str(dump_default=None)
    number = fields.Int(data_key="#", dump_default=None)
    source = fields.Str(dump_default=None)
    ir_number = fields.Str(data_key="ir_#", dump_default=None)
    ir_issuance_date = fields.Str(dump_default=None)
    id = fields.Int(dump_default=None)
