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
"""Topic Schema."""
from marshmallow import EXCLUDE, fields, validate

from compliance_api.models.topic import Topic

from .base_schema import AutoSchemaBase, BaseSchema


class TopicSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """topic schema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE
        model = Topic
        include_fk = True


class TopicCreateSchema(BaseSchema):  # pylint: disable=too-many-ancestors
    """topic create Schema."""

    name = fields.Str(
        metadata={"description": "The name of the topic"},
        required=True,
        validate=validate.Length(min=1, error="Name cannot be an empty string"),
    )
