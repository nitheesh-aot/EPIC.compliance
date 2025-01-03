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
"""Inspection requirement Schema Schema."""
from marshmallow import EXCLUDE, fields

from compliance_api.models import InspectionReqDetailDocument, InspectionReqSourceDetail, InspectionRequirement

from .base_schema import AutoSchemaBase, BaseSchema


class InspectionReqDetailDocCreateSchema(BaseSchema):
    """InpsectionReqDetailDocCreateSchema."""

    document_type_id = fields.Int(
        metadata={"description": "The unique identifier of the document type"},
        required=True,
    )
    document_title = fields.Str(metadata={"description": "The title of the document"})
    section_number = fields.Str(
        metadata={
            "description": "The highlighted section number in the uploaded document"
        }
    )
    section_title = fields.Str(
        metadata={"description": "Additional description of the document"}
    )


class InspectionReqSourceDetailCreateSchema(BaseSchema):
    """InspectionReqSourceDetailSchema."""

    requirement_source_id = fields.Int(
        metadata={"description": "The unique identifier of the requirement."},
        required=True,
    )
    section_number = fields.Str(
        metadata={
            "description": "The optional section number associated with requirement sources"
            "(Act (2018), Schedule A, Compliance Agreement, Act (2002))"
        }
    )
    condition_number = fields.Str(
        metadata={
            "description": "The optional condition number associated with"
            "rquirement sources(Schedule B, EAC Certificate)"
        }
    )
    amendment_number = fields.Str(
        metadata={
            "description": "The optional amendment number if the requirement source is EAC Amendment"
        }
    )
    title = fields.Str(
        metadata={"description": "The title of the requirement source detail"}
    )
    description = fields.Str(
        metadata={"description": "The description of the requirement source detail"}
    )
    documents = fields.List(fields.Nested(InspectionReqDetailDocCreateSchema))


class InspectionRequirementCreateSchema(BaseSchema):
    """InspectionRequirementCreateSchema."""

    summary = fields.Str(
        metadata={"description": "The summary of the requirement."}, required=True
    )
    topic_id = fields.Int(
        metadata={
            "description": "The unique identifier of the topic associated with the inspection"
        },
        required=True,
    )
    enforcement_action_id = fields.Int(
        metadata={"description": "The enforcement action identifier."}
    )
    compliance_finding_id = fields.Int(
        metadata={"description": "The unique identifier of the compliance findings."}
    )
    findings = fields.Str(
        metadata={"description": "The requirement findings in html format."}
    )
    sort_order = fields.Int(
        metadata={"description": "The order of the inspection requirements"},
        required=True,
    )
    requirement_source_details = fields.List(
        fields.Nested(InspectionReqSourceDetailCreateSchema)
    )


class InspectionReqDetailDocSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors
    """InspectionReqDetailDocSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionReqDetailDocument
        include_fk = True


class InspectionReqSourceDetailSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors
    """InspectionReqSourceSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionReqSourceDetail
        include_fk = True

    documents = fields.List(fields.Nested(InspectionReqDetailDocSchema))


class InspectionRequirementSchema(AutoSchemaBase):  # pylint: disable=too-many-ancestors
    """InspectionRequirementSchema."""

    class Meta(AutoSchemaBase.Meta):  # pylint: disable=too-few-public-methods
        """Meta."""

        unknown = EXCLUDE
        model = InspectionRequirement
        include_fk = True

    requirement_source_details = fields.List(
        fields.Nested(InspectionReqSourceDetailSchema)
    )
