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
            _create_update_source_details_nd_docs(
                created_requirement.id, requirement_data, session
            )
        return created_requirement

    @classmethod
    def update(cls, inspection_id, requirement_id, requirement_data):
        """Update inspection requirement."""
        requirement_obj = _create_requirement_obj(inspection_id, requirement_data)
        with session_scope() as session:
            updated_requirement = InspectionRequirementModel.update_requirement(
                requirement_id, requirement_obj, session
            )
            _handle_deletion_req_detail_nd_doc(
                requirement_id, requirement_data, session
            )
            _create_update_source_details_nd_docs(
                requirement_id, requirement_data, session
            )
        return updated_requirement


def _create_update_source_details_nd_docs(
    requirement_id, requirement_data, session=None
):
    """
    Persist the source details and related document details.

    This function check if the id is present in the data. If it is present, no need to
    create object again.
    """
    for source_detail_data in requirement_data.get("requirement_source_details", []):
        req_detail_id = source_detail_data.get("id", None)
        source_detail_obj = _create_requirement_source_detail_obj(
            requirement_id, source_detail_data
        )
        if not req_detail_id:
            created_source_detail = InspectionReqSourceDetailModel.create_source_detail(
                source_detail_obj, session
            )
            req_detail_id = created_source_detail.id
        else:
            source_detail_obj = {**source_detail_obj, "id": req_detail_id}
            InspectionReqSourceDetailModel.update_requirement_source_detail(
                req_detail_id, source_detail_obj, session
            )
        for doc_detail_data in source_detail_data.get("documents", []):
            doc_detail_id = doc_detail_data.get("id", None)
            doc_detail_obj = _create_requirement_source_doc_obj(
                req_detail_id, doc_detail_data
            )
            if not doc_detail_id:
                InspectionReqDetailDocumentModel.create_doc_detail(
                    doc_detail_obj, session
                )
            else:
                doc_detail_obj = {**doc_detail_obj, "id": doc_detail_id}
                InspectionReqDetailDocumentModel.update_doc_detail(
                    doc_detail_id, doc_detail_obj, session
                )


def _handle_deletion_req_detail_nd_doc(
    requirement_id,
    requirement_data,
    session=None,
):
    """Handle the deletion of requirement details and related document entry."""
    existing_details = InspectionReqSourceDetailModel.get_all_by_requirement_id(
        requirement_id
    )
    existing_detail_ids = {detail.id for detail in existing_details}
    incoming_details_ids = {
        detail.get("id", None)
        for detail in requirement_data.get("requirement_source_details")
        if detail.get("id", None) is not None
    }
    incoming_doc_detail_ids = set(
        doc.get("id", None)
        for detail in requirement_data.get("requirement_source_details")
        for doc in detail.get("documents", [])
        if doc.get("id", None) is not None
    )
    existing_doc_detail_ids = {
        doc.id for detail in existing_details for doc in detail.documents
    }
    details_to_be_deleted = existing_detail_ids.difference(incoming_details_ids)
    doc_details_to_be_deleted = existing_doc_detail_ids.difference(
        incoming_doc_detail_ids
    )
    InspectionReqDetailDocumentModel.delete_req_doc_details_by_ids(
        details_to_be_deleted, session
    )
    InspectionReqDetailDocumentModel.delete_req_doc_details_by_ids(
        doc_details_to_be_deleted, session
    )


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
