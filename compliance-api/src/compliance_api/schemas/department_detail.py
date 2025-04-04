"""Department Detail Schema."""

from marshmallow import EXCLUDE, Schema, fields
from compliance_api.models.department_detail import DepartmentDetail as DepartmentDetailModel
from .base_schema import AutoSchemaBase


class DepartmentDetailsSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Department Detail Schema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = DepartmentDetailModel
        include_fk = True
