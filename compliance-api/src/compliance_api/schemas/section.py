"""Section Schema."""

from marshmallow import EXCLUDE, fields

from ..models.section import Section
from .base_schema import AutoSchemaBase


class SectionSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Section Schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta class for Section schema."""

        model = Section
        load_instance = True
        unknown = EXCLUDE
        include_fk = True

    id = fields.Integer(required=True)
    name = fields.String(required=True)
    act = fields.Integer(required=True)
