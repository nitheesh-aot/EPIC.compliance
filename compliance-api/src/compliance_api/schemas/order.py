"""Order Schemas."""

from marshmallow import EXCLUDE, fields, post_dump, post_load
from marshmallow_enum import EnumField

from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT

from ..models.order import Order, OrderStatusEnum
from .base_schema import AutoSchemaBase, BaseSchema
from .section import SectionSchema
from .staff_user import StaffUserSchema


class OrderUpdateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """Schema for order model."""

    section_id = fields.Integer(
        allow_none=True, metadata={"description": "The section id"}
    )
    issuing_officer_id = fields.Integer(
        allow_none=True, metadata={"description": "The issuing officer id"}
    )
    intended_issuance_date = fields.DateTime(
        allow_none=True,
        format=INPUT_DATE_TIME_FORMAT,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
        metadata={"description": "The intended issuance date"},
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


class OrderCreateSchema(OrderUpdateSchema):  # pylint: disable=too-many-ancestors
    """Schema for order model."""

    order_number = fields.String(
        allow_none=True, metadata={"description": "The unique order number."}
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

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the inspection status enum."""
        if "order_status" in data and data["order_status"] is not None:
            data["order_status"] = OrderStatusEnum(data["order_status"]).value
        else:
            data["order_status"] = ""
        return data


class OrderStatusSchema(BaseSchema):
    """OrderStatusSchema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    status = EnumField(
        OrderStatusEnum,
        metadata={"description": "The status of the order"},
        required=True,
    )

    @post_load
    def extract_status_value(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the status enum."""
        status_enum = data.get("status")
        if status_enum:
            data["status"] = status_enum.value
        return data


class OrderIssueSchema(BaseSchema):
    """OrderIssueSchema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    date_issued = fields.DateTime(
        allow_none=True,
        format=INPUT_DATE_TIME_FORMAT,
        error_messages={
            "invalid": f"Not a valid datetime. Expected format: {INPUT_DATE_TIME_FORMAT}."
        },
        metadata={"description": "The date the order was issued"},
    )
