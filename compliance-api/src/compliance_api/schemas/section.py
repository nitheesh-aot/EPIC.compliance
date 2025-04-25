"""Section Schema."""

from marshmallow import EXCLUDE, fields

from ..models.section import Section
from .base_schema import AutoSchemaBase


class SectionSchema(AutoSchemaBase):
    """Section Schema."""

    class Meta:
        """Meta class for Section schema."""

        model = Section
        load_instance = True
        unknown = EXCLUDE
        include_fk = True

    id = fields.Integer(required=True)
    name = fields.String(required=True)
    description = fields.String(required=True)
