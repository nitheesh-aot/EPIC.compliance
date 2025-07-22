"""Administrative Penalty Schemas."""

from marshmallow import EXCLUDE, ValidationError, fields, post_dump, validates_schema
from marshmallow_enum import EnumField

from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT

from ..models.administrative_penalty import (
    AdministrativePenalty,
    AdministrativePenaltyInspectionRequirementMap,
    DecisionEnum,
    ReferralStatusEnum,
)
from .base_schema import AutoSchemaBase, BaseSchema
from .inspection_requirement import InspectionRequirementSchema

class AdministrativePenaltyUpdateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """Schema for administrative penalty model."""

    inspection_id = fields.Integer(
        required=True, metadata={"description": "The inspection id"}
    )
    referral_status = EnumField(
        ReferralStatusEnum,
        by_value=True,
        allow_none=True,
        metadata={"description": "The referral status of the administrative penalty"},
    )
    date_referred = fields.DateTime(
        allow_none=True,
        format=INPUT_DATE_TIME_FORMAT,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
        metadata={"description": "The date referred to decision maker"},
    )
    decision_date = fields.DateTime(
        allow_none=True,
        format=INPUT_DATE_TIME_FORMAT,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
        metadata={"description": "The decision date"},
    )
    decision = EnumField(
        DecisionEnum,
        by_value=True,
        allow_none=True,
        metadata={"description": "The decision on the administrative penalty"},
    )
    penalty_amount = fields.Decimal(
        places=2,
        allow_none=True,
        metadata={"description": "The penalty amount"},
    )
    inspection_requirement_ids = fields.List(
        fields.Integer(),
        required=True,
        metadata={
            "description": "List of inspection requirement IDs associated with the administrative penalty."
        },
    )
    
    @validates_schema
    def validate_penalty_amount(self, data, **kwargs):
        """Validate that penalty_amount is required when decision is present."""
        if data.get("decision") and not data.get("penalty_amount"):
            raise ValidationError("Penalty amount is required when a decision is provided", "penalty_amount")


class AdministrativePenaltyCreateSchema(
    AdministrativePenaltyUpdateSchema
):  # pylint: disable=too-many-ancestors
    """Schema for administrative penalty model."""

    administrative_penalty_number = fields.String(
        allow_none=True, metadata={"description": "The unique administrative penalty number."}
    )


class AdministrativePenaltyInspectionRequirementMapSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors
    """Schema for administrative penalty inspection requirement map model."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = AdministrativePenaltyInspectionRequirementMap
        include_fk = True

    inspection_requirement = fields.Nested(
        InspectionRequirementSchema(),
        only=("id", "summary"),
    )


class AdministrativePenaltySchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for administrative penalty model."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = AdministrativePenalty
        include_fk = True

    administrative_penalty_requirement_maps = fields.Nested(
        AdministrativePenaltyInspectionRequirementMapSchema(),
        many=True,
        only=("id", "inspection_requirement_id", "inspection_requirement"),
    )

    @post_dump
    def transform_data(self, data, **kwargs):
        """Transform data after serialization."""
        # Convert enum values to their string representation
        if "referral_status" in data and data["referral_status"]:
            data["referral_status"] = data["referral_status"]["value"]
        
        if "decision" in data and data["decision"]:
            data["decision"] = data["decision"]["value"]
        
        return data


class ReferralStatusSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """ReferralStatusSchema."""

    referral_status = EnumField(
        ReferralStatusEnum,
        by_value=True,
        metadata={"description": "The referral status of the administrative penalty"},
        required=True,
    )

    @post_dump
    def extract_status_value(self, data, **kwargs):
        """Extract the value of the status enum."""
        if "referral_status" in data and data["referral_status"]:
            data["referral_status"] = data["referral_status"]["value"]
        return data


class DecisionSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """DecisionSchema."""

    decision = EnumField(
        DecisionEnum,
        by_value=True,
        metadata={"description": "The decision on the administrative penalty"},
        required=True,
    )
    decision_date = fields.DateTime(
        allow_none=True,
        format=INPUT_DATE_TIME_FORMAT,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
        metadata={"description": "The decision date"},
    )
    penalty_amount = fields.Decimal(
        places=2,
        required=True,
        metadata={"description": "The penalty amount"},
    )

    @post_dump
    def extract_decision_value(self, data, **kwargs):
        """Extract the value of the decision enum."""
        if "decision" in data and data["decision"]:
            data["decision"] = data["decision"]["value"]
        return data
