"""Order Schemas."""

from marshmallow import EXCLUDE, fields

from ..models.order import Order
from .base_schema import AutoSchemaBase, BaseSchema
from .section import SectionSchema
from .staff_user import StaffUserSchema


class OrderCreateSchema(BaseSchema):
    """Schema for order model."""

    order_number = fields.String(
        required=True, metadata={"description": "The unique order number."}
    )
    section_id = fields.Integer(
        required=True, metadata={"description": "The section id"}
    )
    issuing_officer_id = fields.Integer(
        required=True, metadata={"description": "The issuing officer id"}
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
        allow_none=True,
        metadata={
            "description": "List of inspection requirement IDs associated with the order."
        },
    )


class OrderSchema(AutoSchemaBase):
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

    # @post_dump
    # def post_dump_actions(
    #     self, data, many, **kwargs
    # ):  # pylint: disable=no-self-use, unused-argument
    #     """Extract the value of the order status enum."""
    #     if "status" in data and data.get("status", None) is not None:
    #         data["status"] = OrderStatusEnum(data["status"]).value
    #     else:
    #         data["status"] = ""
    #     return data
