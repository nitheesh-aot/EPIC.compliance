"""InspectionRequirementService."""

from compliance_api.models import InspectionReqDetailDocument as InspectionReqDetailDocumentModel
from compliance_api.models import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.db import session_scope


class InspectionRequirementService:
    """InspectionRequirementService."""

    @classmethod
    def get_all(cls, inspection_id):
        """Get all requirements by inspection id."""
        return InspectionRequirementModel.get_by_inspection_id(inspection_id)

    @classmethod
    def get_by_id(cls, requirement_id):
        """Get inspection requirement by id."""
        return InspectionReqDetailDocumentModel.find_by_id(requirement_id)

    @classmethod
    def create(cls, inspection_id, requirement_data):
        """Create inspection requirement."""
        requirement_obj = _create_requirement_obj(inspection_id, requirement_data)
        with session_scope() as session:
            created_requirement = InspectionRequirementModel.create_requirement(
                requirement_obj, session
            )
            for source_detail_data in requirement_data["requirement_source_details"]:
                source_detail_obj = _create_requirement_source_detail_obj(
                    created_requirement.id, source_detail_data
                )
                created_source_detail = (
                    InspectionReqSourceDetailModel.create_source_detail(
                        source_detail_obj, session
                    )
                )
                for doc_detail_data in source_detail_data["documents"]:
                    doc_detail_obj = _create_requirement_source_doc_obj(
                        created_source_detail.id, doc_detail_data
                    )
                    InspectionReqDetailDocumentModel.create_doc_detail(doc_detail_obj)
        return created_requirement


    @classmethod
    def update(cls, inspection_id, requirement_id, requirement_data):
        """Update inspection requirement."""
        requirement_obj = _create_requirement_obj(inspection_id, requirement_data)
        with session_scope() as session:
            updated_requirement = InspectionRequirementModel
def _create_requirement_obj(inspection_id, requirement_data):
    """Create inspection requirement object."""
    return {
        "inspection_id": inspection_id,
        "summary": requirement_data.get("summary"),
        "topic_id": requirement_data.get("topic_id"),
        "sort_order": requirement_data.get("sort_order"),
        "enforcement_action_id": requirement_data.get("enforcement_action_id", None),
        "compliance_finding_id": requirement_data.get("compliance_finding_id", None),
        "findings": requirement_data.get("findings", None),
    }


def _create_requirement_source_detail_obj(requirement_id, requirement_source_data):
    """Create requirement source details object."""
    return {
        "requirement_id": requirement_id,
        "requirement_source_id": requirement_source_data.get("requirement_source_id"),
        "section_number": requirement_source_data.get("section_number", None),
        "condition_number": requirement_source_data.get("condition_number", None),
        "amendment_number": requirement_source_data.get("amendment_number", None),
        "title": requirement_source_data.get("title", None),
        "description": requirement_source_data.get("description", None),
    }


def _create_requirement_source_doc_obj(
    requirement_source_detail_id, requirement_source_doc_data
):
    """Create requirement source doc details object."""
    return {
        "req_detail_id": requirement_source_detail_id,
        "document_type_id": requirement_source_doc_data.get("document_type_id"),
        "document_title": requirement_source_doc_data.get("document_title"),
        "section_number": requirement_source_doc_data.get("section_number", None),
        "section_title": requirement_source_doc_data.get("section_title", None),
        "description": requirement_source_doc_data.get("description", None),
    }
