"""Schema of continuation report."""

from marshmallow import EXCLUDE, fields
from marshmallow_enum import EnumField

from compliance_api.models.continuation_report import ContextTypeEnum, ContinuationReport, ContinuationReportKey

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
        ContextTypeEnum,
        metadata={
            "description": "The context in which the entry is being made. Eg: When an Inspection is created."
        },
        by_value=True,
        required=True,
    )


class ContinuationReportSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """ContinuationReportSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = ContinuationReport
        include_fk = True


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
        ContextTypeEnum,
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


class ContinuationReportKeySchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """ContinuationReportKeySchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = ContinuationReportKey
