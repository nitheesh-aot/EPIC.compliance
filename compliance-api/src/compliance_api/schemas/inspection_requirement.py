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
from marshmallow import EXCLUDE, ValidationError, fields, pre_dump, validates_schema

from compliance_api.models import InspectionReqDetailDocument, InspectionReqSourceDetail, InspectionRequirement
from compliance_api.models.requirement_source import RequirementSourceEnum

from .base_schema import AutoSchemaBase, BaseSchema
from .common import KeyValueSchema


class InspectionReqDetailDocCreateSchema(BaseSchema):
    """InpsectionReqDetailDocCreateSchema."""

    document_type_id = fields.Int(
        metadata={"description": "The unique identifier of the document type"},
        required=True,
    )
    document_title = fields.Str(metadata={"description": "The title of the document"})
    description = fields.Str(
        metadata={"description": "The description of the document"}, required=True
    )
    section_number = fields.Str(
        metadata={
            "description": "The highlighted section number in the uploaded document"
        }
    )
    section_title = fields.Str(
        metadata={"description": "Additional description of the document"}
    )


class InspectionReqDetailDocUpdateSchema(InspectionReqDetailDocCreateSchema):
    """InspectionReqDetailDocUpdateSchema."""

    id = fields.Int(
        metadata={
            "description": "The unique identifier of the requirement detail document"
        }
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
            "rquirement sources(Schedule B, EAC Certificate, EAC Amendment)"
        }
    )
    amendment_number = fields.Str(
        metadata={
            "description": "The amendment number if the requirement source is EAC Amendment"
        }
    )
    title = fields.Str(
        metadata={"description": "The title of the requirement source detail"}
    )
    description = fields.Str(
        metadata={"description": "The description of the requirement source detail"},
        required=True,
    )
    documents = fields.List(fields.Nested(InspectionReqDetailDocCreateSchema))

    @validates_schema
    def validate_section_number(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure the correct requirement is selected for the section number."""
        section_number = data.get("section_number", [])
        requirement_source_id = data.get("requirement_source_id", None)
        if section_number and RequirementSourceEnum(requirement_source_id) not in [
            RequirementSourceEnum.ACT_2002,
            RequirementSourceEnum.ACT_2018,
            RequirementSourceEnum.COMPLIANCE_AGREEMENT,
            RequirementSourceEnum.CERTIFIED_PROJECT_DESCRIPTION,
            RequirementSourceEnum.NOT_EA_ACT,
        ]:
            raise ValidationError(
                "Invalid requirement source for the given section number",
                field_name="section_number",
            )

    @validates_schema
    def validate_amendment_number(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure the correct requirement is selected for the amendment number."""
        amendment_number = data.get("amendment_number", [])
        requirement_source_id = data.get("requirement_source_id", None)
        if (
            RequirementSourceEnum(requirement_source_id)
            == RequirementSourceEnum.EAC_AMENDMENT
            and not amendment_number
        ):
            raise ValidationError(
                "Amendment number is mandatory when the requirement source is EAC_AMENDMENT",
                field_name="amendment_number",
            )

    @validates_schema
    def validate_condition_number(
        self, data, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Ensure the correct requirement is selected for the condition number."""
        condition_number = data.get("condition_number", [])
        requirement_source_id = data.get("requirement_source_id", None)
        if condition_number and RequirementSourceEnum(requirement_source_id) not in [
            RequirementSourceEnum.SCHEDULE_B,
            RequirementSourceEnum.EAC_CERTIFICATE,
            RequirementSourceEnum.EAC_AMENDMENT,
        ]:
            raise ValidationError(
                "Invalid requirement source for the given condition number",
                field_name="condition_number",
            )


class InspectionReqSourceDetailUpdateSchema(InspectionReqSourceDetailCreateSchema):
    """InspectionRequirementUpdateSchema."""

    id = fields.Int(
        metadata={
            "description": "The unique identifier of the requirement source detail."
        }
    )
    documents = fields.List(fields.Nested(InspectionReqDetailDocUpdateSchema))


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
    enforcement_action_ids = fields.List(
        fields.Int(metadata={"description": "The enforcement action identifier."}),
        allow_none=True,
    )
    compliance_finding_id = fields.Int(
        metadata={"description": "The unique identifier of the compliance findings."}
    )
    findings = fields.Str(
        metadata={"description": "The requirement findings in html format."},
        required=True,
    )
    requirement_source_details = fields.List(
        fields.Nested(InspectionReqSourceDetailCreateSchema)
    )


class InspectionRequirementUpdateSchema(InspectionRequirementCreateSchema):
    """InspectionRequirementUpdateSchema."""

    id = fields.Int(
        metadata={"description": "The unique identifier of the requirement"}
    )
    requirement_source_details = fields.List(
        fields.Nested(InspectionReqSourceDetailUpdateSchema)
    )


class InspectionSortOrderSchema(BaseSchema):
    """InspectionSortOrderSchema."""

    order = fields.Int(
        metadata={
            "description": "The index to which the inspection requirement should be moved."
        },
        required=True,
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

    document_type = fields.Nested(KeyValueSchema)


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
    requirement_source = fields.Nested(KeyValueSchema)


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
    topic = fields.Nested(KeyValueSchema)
    compliance_finding = fields.Nested(KeyValueSchema)
    enforcement_action_data = fields.List(fields.Nested(KeyValueSchema))

    @pre_dump
    def pre_dump_enforcement_actions(
        self, obj, many, **kwargs
    ):  # pylint: disable=no-self-use, unused-argument
        """Extract the value of the enforcement actions."""
        if hasattr(obj, "enforcement_actions"):
            prepared_enforcement_actions = []
            for action in obj.enforcement_actions:
                if hasattr(action, "enforcement_action") and action.enforcement_action:
                    prepared_enforcement_actions.append(
                        {
                            "id": action.enforcement_action.id,
                            "name": action.enforcement_action.name,
                        }
                    )
            obj.enforcement_action_data = prepared_enforcement_actions
        return obj
