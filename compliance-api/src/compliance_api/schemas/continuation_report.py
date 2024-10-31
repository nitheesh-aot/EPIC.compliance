"""Schema of continuation report."""

from marshmallow import EXCLUDE, fields, post_dump
from marshmallow_enum import EnumField

from compliance_api.models.continuation_report import ContinuationReport, ContinuationReportKey
from compliance_api.utils.enum import ContextEnum

from .base_schema import AutoSchemaBase, BaseSchema


class ContinuationReportKeyCreateSchema(
    BaseSchema
):  # pylint: disable=too-many-ancestors
    """ContinuationReportKeyCreateSchema."""

    key = fields.Str(
        metadata={
            "description": "The key in the report entry content which needs to be a hyperlink"
        },
    )
    key_context = EnumField(
        ContextEnum,
        metadata={
            "description": "The context in which the entry is being made. Eg: When an Inspection is created."
        },
        by_value=True,
        required=True,
    )


class ContinuationReportKeySchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """ContinuationReportKeySchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = ContinuationReportKey

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of key_context enum."""
        if "key_context" in data and data["key_context"] is not None:
            data["key_context"] = ContextEnum(
                data["key_context"]
            ).value
        else:
            data["key_context"] = ""
        return data


class ContinuationReportSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """ContinuationReportSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = ContinuationReport
        include_fk = True

    keys = fields.List(fields.Nested(ContinuationReportKeySchema))

    @post_dump
    def post_dump_actions(
        self, data, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of context enum."""
        if "context_type" in data and data["context_type"] is not None:
            data["context_type"] = ContextEnum(
                data["context_type"]
            ).value
        else:
            data["context_type"] = ""
        return data


class ContinuationReportCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """ContinuationReportCreateSchema."""

    case_file_id = fields.Int(
        metadata={"description": "The unique identifier of the associated case file."},
        required=True,
    )
    text = fields.Str(
        metadata={"description": "The content in plane text format"},
        allow_none=True,
        required=True,
    )
    rich_text = fields.Str(
        metadata={"description": "The content in html formatted"},
        allow_none=True,
        required=True,
    )
    context_type = EnumField(
        ContextEnum,
        metadata={
            "description": "The context in which the entry is being made. Eg: When an Inspection is created."
        },
        by_value=True,
        required=True,
    )
    context_id = fields.Int(
        metadata={"description": "The unique identifier of the context type entity"},
        required=True,
    )
    keys = fields.List(
        fields.Nested(ContinuationReportKeyCreateSchema),
        metadata={"description": "A list of keys associated with the report content"},
        required=False,
        allow_none=True,
    )
