"""Pagination schema."""

from marshmallow import fields

from .base_schema import BaseSchema


class PaginationParameterSchema(BaseSchema):
    """PaginationParameterSchema."""

    page_no = fields.Int(
        metadata={"description": "The current page to be returned."}, missing=1
    )
    page_size = fields.Int(
        metadata={"description": "The total number of items per page."}, missing=10
    )
