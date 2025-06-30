"""InspectionRequirementService."""

from typing import List

import requests
from bs4 import BeautifulSoup

from compliance_api.exceptions import BadRequestError, ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import Appendix as AppendixModel
from compliance_api.models import ImageTypeEnum
from compliance_api.models import InspectionReqDetailDocument as InspectionReqDetailDocumentModel
from compliance_api.models import InspectionReqEnforcementMap as InspectionReqEnforcementMapModel
from compliance_api.models import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models import InspectionRequirement as InspectionRequirementModel
from compliance_api.models import InspectionRequirementImage as InspectionRequirementImageModel
from compliance_api.models import WarningLetter as WarningLetterModel
from compliance_api.models import WarningLetterProgressEnum
from compliance_api.models.db import session_scope
from compliance_api.models.enforcement_action import EnforcementActionOptionEnum
from compliance_api.models.order import Order as OrderModel
from compliance_api.models.order import OrderProgressEnum
from compliance_api.services.document_service.doc_service import DocService
from compliance_api.services.document_service.doc_service_enum import ActionOnFileEnum

from .service_utils import ServiceUtils


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
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_status_check(inspection)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirements = InspectionRequirementModel.get_by_inspection_id(inspection_id)
        requirement_obj = _create_requirement_obj(inspection_id, requirement_data)
        requirement_obj["sort_order"] = len(requirements) + 1
        with session_scope() as session:
            created_requirement = InspectionRequirementModel.create_requirement(
                requirement_obj, session
            )
            _create_update_source_details_nd_docs(
                inspection, created_requirement.id, requirement_data, session
            )
            cls.insert_or_update_enforcements(
                created_requirement.id,
                requirement_data.get("enforcement_action_ids", []),
                session,
            )
            #  inserting photos
            created_photos = _insert_or_update_images(
                requirement_id=created_requirement.id,
                images=requirement_data.get("photos", []),
                image_type=ImageTypeEnum.PHOTO,
                session=session,
            )
            created_figures = _insert_or_update_images(
                requirement_id=created_requirement.id,
                images=requirement_data.get("figures", []),
                image_type=ImageTypeEnum.FIGURE,
                session=session,
            )
            _update_the_findigs_by_images(
                photos=created_photos,
                figures=created_figures,
                requirement=created_requirement,
                session=session,
            )
        return created_requirement

    @classmethod
    def update(cls, inspection_id, requirement_id, requirement_data):
        """Update inspection requirement."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_status_check(inspection)
        _requirement_check(requirement_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirement_obj = _create_requirement_obj(inspection_id, requirement_data)
        with session_scope() as session:
            _check_enforcement_action_existennce(
                requirement_data.get("enforcement_action_ids", []),
                requirement_id,
                inspection_id,
                session,
            )
            updated_requirement = InspectionRequirementModel.update_requirement(
                requirement_id, requirement_obj, session
            )
            _handle_deletion_req_detail_nd_doc(
                requirement_id, requirement_data, session
            )
            _create_update_source_details_nd_docs(
                inspection, requirement_id, requirement_data, session
            )
            cls.insert_or_update_enforcements(
                requirement_id,
                requirement_data.get("enforcement_action_ids", []),
                session,
            )
            created_photos = _insert_or_update_images(
                requirement_id=requirement_id,
                images=requirement_data.get("photos", []),
                image_type=ImageTypeEnum.PHOTO,
                session=session,
            )
            created_figures = _insert_or_update_images(
                requirement_id=requirement_id,
                images=requirement_data.get("figures", []),
                image_type=ImageTypeEnum.FIGURE,
                session=session,
            )
            _update_the_findigs_by_images(
                photos=created_photos,
                figures=created_figures,
                requirement=updated_requirement,
                session=session,
            )
        return updated_requirement

    @classmethod
    def delete(cls, inspection_id, requirement_id):
        """Delete the requirement."""
        # TODO: CHECK ORDERS AND WARNING LETTERS BEFORE DELETING THE REUQIREMENT
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_status_check(inspection)
        _requirement_check(requirement_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        with session_scope() as session:
            InspectionRequirementModel.delete_requirement(requirement_id, session)
            InspectionReqSourceDetailModel.delete_by_requirement_id(
                requirement_id, session
            )
            InspectionReqDetailDocumentModel.delete_by_requirement_id(
                requirement_id, session
            )
            # Querying the latest requirements after deleting the item
            requirements = InspectionRequirementModel.get_by_inspection_id(
                inspection_id
            )
            cls.insert_or_update_enforcements(
                requirement_id, enforcement_ids=[], session=session
            )
            _update_sort_order_subsequent(requirements)

    @classmethod
    def update_sort_order(cls, inspection_id, requirement_id, sort_order_data):
        """Update the sort order of the inspection requirement."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_status_check(inspection)
        requirement = _requirement_check(requirement_id)
        ServiceUtils.access_check_update_for_inspection(inspection)

        new_sort_order = sort_order_data.get("order")
        requirements = InspectionRequirementModel.get_by_inspection_id(inspection_id)
        if new_sort_order > len(requirements):
            raise BadRequestError(
                f"Invaid order. The order should be less than or equal to {len(requirements)}"
            )
        del requirements[requirement.sort_order - 1]
        requirements.insert(new_sort_order - 1, requirement)
        _update_sort_order_subsequent(requirements, commit=True)

    @classmethod
    def insert_or_update_enforcements(
        cls, requirement_id: int, enforcement_ids: list[int], session=None
    ):
        """Insert/Update enforcement_ids associated with a given requirement."""
        if enforcement_ids is not None:
            existing_enforecements = (
                InspectionReqEnforcementMapModel.get_all_by_requirement_id(
                    requirement_id
                )
            )
            existing_enf_ids = {
                enf.enforcement_action_id for enf in existing_enforecements
            }

            new_enf_ids = set(enforcement_ids)
            enf_ids_to_be_deleted = existing_enf_ids.difference(new_enf_ids)
            enf_ids_to_be_added = new_enf_ids.difference(existing_enf_ids)
            if enf_ids_to_be_deleted:
                InspectionReqEnforcementMapModel.bulk_delete(
                    requirement_id, list(enf_ids_to_be_deleted), session
                )
            if enf_ids_to_be_added:
                InspectionReqEnforcementMapModel.bulk_insert(
                    requirement_id, list(enf_ids_to_be_added), session
                )

    @classmethod
    def get_all_images(cls, inspection_id, requirement_id, image_type: ImageTypeEnum):
        """Get all photos."""
        ServiceUtils.inspection_exist_check(inspection_id)
        _requirement_check(requirement_id)
        images = InspectionRequirementImageModel.find_all_images(
            requirement_id=requirement_id, image_type=image_type
        )
        images = _set_signed_url(images)

    @classmethod
    def get_all_images_by_inspection(cls, inspection_id):
        """Get all images per inspection."""
        ServiceUtils.inspection_exist_check(inspection_id)
        images = InspectionRequirementImageModel.get_all_images_by_inspection(
            inspection_id
        )
        images = _set_signed_url(images)
        return images

    @classmethod
    def delete_image(cls, inspection_id, requirement_id, relative_url, image_type):
        """Delete image."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_status_check(inspection)
        _requirement_check(requirement_id)
        image = InspectionRequirementImageModel.find_image_by_url(
            requirement_id, relative_url, image_type
        )
        if not image:
            raise UnprocessableEntityError(
                f"No {image_type.value} found for the given relative url"
            )
        #  Get the presigned delete url for the file
        presigned_url_response = DocService.get_presigned_url(
            {
                "relative_url": image.relative_url,
                "action": ActionOnFileEnum.DELETE.value,
            }
        )
        presigned_delete_url = presigned_url_response.get("presigned_url")
        #  Delete the actual file from cloud storage
        delete_response = requests.delete(presigned_delete_url, timeout=120)
        #  Mark the deletion in the inspection_req_images table
        InspectionRequirementImageModel.delete_image(image.id)
        return delete_response

    @classmethod
    def update_requirements(cls, inspection_id: int, requirements_data: List[dict]):
        """Update multiple inspection requirements and their images.

        Args:
            inspection_id (int): The ID of the inspection
            requirements_data (List[dict]): List of requirement updates

        Raises:
            ResourceNotFoundError: If inspection or requirement not found
        """
        # Verify inspection exists and check access
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)

        with session_scope() as session:
            for req_data in requirements_data:
                requirement_id = req_data["requirement_id"]
                findings = req_data.get("findings")
                images = req_data.get("images", [])

                # Update requirement findings
                requirement = _requirement_check(requirement_id)
                if requirement.inspection_id != inspection_id:
                    raise ResourceNotFoundError(
                        f"Requirement with id {requirement_id} not found for inspection {inspection_id}"
                    )

                # Update requirement findings using model method
                InspectionRequirementModel.update_requirement(
                    requirement_id, {"findings": findings}, session
                )

                # Update image sort orders using model method
                for image_data in images:
                    image = InspectionRequirementImageModel.query.filter_by(
                        id=image_data["image_id"],
                        requirement_id=requirement_id,
                        is_deleted=False,
                    ).first()

                    if not image:
                        raise ResourceNotFoundError(
                            f"Image with id {image_data['image_id']} not found for requirement {requirement_id}"
                        )

                    InspectionRequirementImageModel.update_image(
                        image_data["image_id"],
                        {"sort_order": image_data["sort_order"]},
                        session,
                    )


def _check_enforcement_action_existennce(
    new_enforcement_ids, requirement_id, inspection_id, session
):
    """
    Check if the corresponding enforcement action such as Order, Warning Letter etc.

    are created. This method throws validation error when these actions are not in DRAFTING status.
    @param new_enforcement_ids: List of new enforcement action ids
    @param requirement_id: Requirement id
    @param inspection_id: Inspection id
    @param session: Database session
    """
    existing_enforcement_maps = (
        InspectionReqEnforcementMapModel.get_all_by_requirement_id(requirement_id)
    )
    existing_enforcement_ids = [
        map.enforcement_action_id for map in existing_enforcement_maps
    ]
    removed_action_ids = set(existing_enforcement_ids).difference(
        set(new_enforcement_ids)
    )
    if removed_action_ids:
        """
        If the removed enforcement action is either ORDER or WARNING LETTER, then check if
        the order or warning letter is in DRAFTING status. If not, throw validation error.
        If the order or warning letter is in DRAFTING status, then delete the order or warning letter.
        """
        if EnforcementActionOptionEnum.ORDER.value in removed_action_ids:
            orders = OrderModel.get_by_inspection_id(inspection_id)
            requirement_orders = [
                order
                for order in orders
                if requirement_id
                in [
                    order_map.inspection_requirement_id
                    for order_map in order.order_requirement_maps
                ]
            ]
            if any(
                [
                    order
                    for order in requirement_orders
                    if order.order_progress != OrderProgressEnum.DRAFTING
                ]
            ):
                raise UnprocessableEntityError(
                    "You cannot change enforcement action as order exists and is not in DRAFTING status."
                )
            else:
                for order in requirement_orders:
                    OrderModel.update_order(
                        order.id, {"is_deleted": True, "is_active": False}, session
                    )
        if EnforcementActionOptionEnum.WARNING_LETTER.value in removed_action_ids:
            warnings = WarningLetterModel.get_by_inspection_id(inspection_id)
            requirement_warnings = [
                warning
                for warning in warnings
                if requirement_id
                in [
                    warning_map.inspection_requirement_id
                    for warning_map in warning.warning_letter_requirement_maps
                ]
            ]
            if any(
                [
                    warning
                    for warning in requirement_warnings
                    if warning.progress != WarningLetterProgressEnum.DRAFTING
                ]
            ):
                raise UnprocessableEntityError(
                    "You cannot change enforcement action as warning letter exists and is not in DRAFTING status."
                )
            else:
                for warning in requirement_warnings:
                    WarningLetterModel.update_warning_letter(
                        warning.id, {"is_deleted": True, "is_active": False}, session
                    )


def _update_the_findigs_by_images(
    photos: list[InspectionRequirementImageModel],
    figures: list[InspectionRequirementImageModel],
    requirement: InspectionRequirementModel,
    session,
):
    """Update the findings by images."""
    findings = requirement.findings
    if not findings:
        return

    # Check if findings contains the data-lexical-mention attribute
    if "data-lexical-mention=" in findings:
        soup = BeautifulSoup(findings, "html.parser")
        # Find all spans with data-lexical-mention attribute set to "true"
        mention_spans = soup.find_all("span", {"data-lexical-mention": "true"})

        for span in mention_spans:
            # Find the photo/figure reference in the span
            mention = span.get("data-mention", "")

            # Check if it's a photo mention
            if mention and mention.lower().startswith("photo "):
                # Extract the photo number
                try:
                    photo_num = int(mention.split(" ")[1])
                    # Find the corresponding photo by sort_order
                    matching_photo = next(
                        (p for p in photos if p.sort_order == photo_num), None
                    )
                    if matching_photo:
                        # Update the image ID in the span
                        span["data-imageid"] = str(matching_photo.id)
                except (ValueError, IndexError):
                    # Invalid photo number format
                    pass

            # Check if it's a figure mention
            elif mention and mention.lower().startswith("figure "):
                # Extract the figure number
                try:
                    figure_num = int(mention.split(" ")[1])
                    # Find the corresponding figure by sort_order
                    matching_figure = next(
                        (f for f in figures if f.sort_order == figure_num), None
                    )
                    if matching_figure:
                        # Update the image ID in the span
                        span["data-imageid"] = str(matching_figure.id)
                except (ValueError, IndexError):
                    # Invalid figure number format
                    pass

        # Update the findings with the modified spans
        requirement.findings = str(soup)
        InspectionRequirementModel.update_requirement(
            requirement.id, {"findings": requirement.findings}, session
        )


def _set_signed_url(images):
    """Set the signed url in the image list."""
    for image in images:
        presigned_url_reponse = DocService.get_presigned_url(
            {
                "relative_url": image.relative_url,
                "action": ActionOnFileEnum.GET.value,
            }
        )
        setattr(
            image,
            "url",
            presigned_url_reponse["presigned_url"],
        )
    return images


def _create_image_obj(requirement_id, img: dict, image_type):
    """Prepare the image object."""
    return {
        "requirement_id": requirement_id,
        "image_type": image_type,
        "sort_order": img.get("sort_order"),
        "original_file_name": img.get("original_file_name"),
        "date_taken": img.get("date_taken"),
        "taken_by_id": img.get("taken_by_id"),
        "caption": img.get("caption", None),
        "relative_url": img.get("relative_url"),
    }


def _insert_or_update_images(
    requirement_id, images: list[dict], image_type: ImageTypeEnum, session=None
):
    """Update the images."""
    # Fetch existing images from the database
    existing_images = InspectionRequirementImageModel.find_all_images(
        requirement_id=requirement_id, image_type=image_type
    )
    existing_image_ids = {img.id for img in existing_images}

    # Track incoming image IDs (existing ones)
    incoming_image_ids = {img["id"] for img in images if "id" in img}

    # DELETE: Remove images that exist in DB but are not in the new list
    images_to_delete = existing_image_ids - incoming_image_ids
    for image_id in images_to_delete:
        InspectionRequirementImageModel.delete_image(image_id, session=session)

    # INSERT or UPDATE images while maintaining order
    inserted_images = []
    for img in images:

        if "id" in img:  # Update existing image
            InspectionRequirementImageModel.update_image(
                img["id"], img, session=session
            )
        else:  # Insert new image
            image_obj = _create_image_obj(
                requirement_id=requirement_id,
                img=img,
                image_type=image_type,
            )
            created_image = InspectionRequirementImageModel.create_image(
                image_obj=image_obj, session=session
            )
            inserted_images.append(created_image)

    return inserted_images


def _update_sort_order_subsequent(requirements, commit=False):
    """Update the new sort order for the requirement."""
    for index, req in enumerate(requirements):
        req.update({"sort_order": index + 1}, commit=commit)


def _requirement_check(requirement_id):
    """Check if requirement exists."""
    requirement = InspectionRequirementModel.find_by_id(requirement_id)
    if not requirement:
        raise ResourceNotFoundError(
            f"Inspection requirement with given ID {requirement_id} not found"
        )
    return requirement


def _create_update_source_details_nd_docs(
    inspection, requirement_id, requirement_data, session=None
):
    """
    Persist the source details and related document details.

    This function check if the id is present in the data. If it is present, no need to
    create object again.
    """
    for source_detail_data in requirement_data.get("requirement_source_details", []):
        req_detail_id = source_detail_data.get("id", None)
        appendix_id = source_detail_data.get("appendix_id", None)
        if appendix_id is not None:
            appendix = AppendixModel.find_by_id(appendix_id)
            if not appendix:
                raise ResourceNotFoundError(
                    f"Appendix with given ID {source_detail_data.get('appendix_id')} not found"
                )
            if appendix.inspection_id != inspection.id:
                raise ResourceNotFoundError(
                    f"Appendix with given ID {source_detail_data.get('appendix_id')} does not belong to this inspection"
                )
        source_detail_obj = _create_requirement_source_detail_obj(
            requirement_id, source_detail_data, inspection
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
            appendix_id = doc_detail_data.get("appendix_id", None)
            if appendix_id is not None:
                appendix = AppendixModel.find_by_id(appendix_id)
                if not appendix:
                    raise ResourceNotFoundError(
                        f"Appendix with given ID {doc_detail_data.get('appendix_id')} not found"
                    )
                if appendix.inspection_id != inspection.id:
                    raise ResourceNotFoundError(
                        f"Appendix with given ID {doc_detail_data.get('appendix_id')} not belong to this inspection"
                    )
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
        for detail in requirement_data.get("requirement_source_details", [])
        if detail.get("id", None) is not None
    }
    incoming_doc_detail_ids = set(
        doc.get("id", None)
        for detail in requirement_data.get("requirement_source_details", [])
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
    InspectionReqSourceDetailModel.delete_req_details_by_ids(
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
        "compliance_finding_id": requirement_data.get("compliance_finding_id", None),
        "findings": requirement_data.get("findings"),
        "agency_id": requirement_data.get("agency_id", None),
        "req_type": requirement_data.get("req_type"),
    }


def _create_requirement_source_detail_obj(
    requirement_id, requirement_source_data, inspection
):
    """Create requirement source details object."""
    #  Check to see if the project is the same for the order and inspection
    _validate_order(requirement_source_data.get("order_id", None), inspection)
    return {
        "requirement_id": requirement_id,
        "requirement_source_id": requirement_source_data.get("requirement_source_id"),
        "appendix_id": requirement_source_data.get("appendix_id", None),
        "section_number": requirement_source_data.get("section_number", None),
        "condition_number": requirement_source_data.get("condition_number", None),
        "order_id": requirement_source_data.get("order_id", None),
        "amendment_number": requirement_source_data.get("amendment_number", None),
        "title": requirement_source_data.get("title", None),
        "description": requirement_source_data.get("description"),
    }


def _validate_order(order_id, inspection):
    """Validate order."""
    if order_id:
        order = OrderModel.find_by_id(order_id)
        inspection_on_order = ServiceUtils.inspection_exist_check(order.inspection_id)
        project_details_on_order = ServiceUtils.get_project_by_case_file_id(
            inspection_on_order.case_file_id
        )
        project_details_on_inspection = ServiceUtils.get_project_by_case_file_id(
            inspection.case_file_id
        )
        if project_details_on_order.get("project"):
            if (
                project_details_on_order.get("project").id
                != project_details_on_inspection.get("project").id
            ):
                raise UnprocessableEntityError(
                    "Project on order and inspection are different"
                )
        if project_details_on_order.get("unapproved_project"):
            if (
                project_details_on_order.get("unapproved_project").id
                != project_details_on_inspection.get("unapproved_project").id
            ):
                raise UnprocessableEntityError(
                    "Unapproved project on order and inspection are different"
                )


def _create_requirement_source_doc_obj(
    requirement_source_detail_id, requirement_source_doc_data
):
    """Create requirement source doc details object."""
    return {
        "req_detail_id": requirement_source_detail_id,
        "document_type_id": requirement_source_doc_data.get("document_type_id"),
        "appendix_id": requirement_source_doc_data.get("appendix_id", None),
        "document_title": requirement_source_doc_data.get("document_title"),
        "section_number": requirement_source_doc_data.get("section_number", None),
        "section_title": requirement_source_doc_data.get("section_title", None),
        "description": requirement_source_doc_data.get("description", None),
    }
