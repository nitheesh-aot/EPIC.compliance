# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Appendix Schema."""
from marshmallow import EXCLUDE, fields

from compliance_api.models.appendix import Appendix

from .base_schema import AutoSchemaBase, BaseSchema


class AppendixSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """Appendix schema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE
        model = Appendix
        include_fk = True


class AppendixCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """Appendix create Schema."""

    appendix_no = fields.Integer(
        metadata={"description": "The unique number of appendix"},
        required=True,
    )
    inspection_id = fields.Integer(
        metadata={"description": "The inspection id"},
        required=True
    )
    document_title = fields.Str(
        metadata={"description": "The title of the document"},
        required=True
    )
