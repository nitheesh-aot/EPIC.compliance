"""Order Schemas."""

from marshmallow import EXCLUDE, fields

from ..models.order import Order
from .base_schema import AutoSchemaBase, BaseSchema
from .section import SectionSchema
from .staff_user import StaffUserSchema


class OrderCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """Schema for order model."""

    order_number = fields.String(
        allow_none=True, metadata={"description": "The unique order number."}
    )
    section_id = fields.Integer(
        allow_none=True, metadata={"description": "The section id"}
    )
    issuing_officer_id = fields.Integer(
        allow_none=True, metadata={"description": "The issuing officer id"}
    )
    intended_issuance_date = fields.DateTime(
        allow_none=True, metadata={"description": "The intended issuance date"}
    )
    where_as = fields.String(allow_none=True, metadata={"description": "The where as"})
    now_therefore = fields.String(
        allow_none=True, metadata={"description": "The now therefore"}
    )
    inspection_requirement_ids = fields.List(
        fields.Integer(),
        required=True,
        metadata={
            "description": "List of inspection requirement IDs associated with the order."
        },
    )


class OrderSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Schema for order model."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = Order
        include_fk = True

    issuing_officer = fields.Nested(
        StaffUserSchema(),
        only=("id", "first_name", "last_name", "name", "auth_user_guid"),
    )
    section = fields.Nested(SectionSchema, only=("id", "name"))
