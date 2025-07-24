"""Service for inspection requirement operations."""

# pylint: disable=too-many-lines

from datetime import datetime
from io import BytesIO
from typing import List

import pandas as pd
import requests
from bs4 import BeautifulSoup
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import aliased

from compliance_api.exceptions import BadRequestError, ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import Appendix as AppendixModel
from compliance_api.models import EnforcementActionOption as EnforcementActionOptionModel
from compliance_api.models import EnforcementActionOptionEnum, ImageTypeEnum
from compliance_api.models import Inspection as InspectionModel
from compliance_api.models import InspectionReqDetailDocument as InspectionReqDetailDocumentModel
from compliance_api.models import InspectionReqEnforcementMap as InspectionReqEnforcementMapModel
from compliance_api.models import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models import InspectionRequirement as InspectionRequirementModel
from compliance_api.models import InspectionRequirementImage as InspectionRequirementImageModel
from compliance_api.models import WarningLetter as WarningLetterModel
from compliance_api.models import WarningLetterProgressEnum
from compliance_api.models.case_file import CaseFile as CaseFileModel
from compliance_api.models.db import db, session_scope
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.inspection_record_approval import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models.order import Order as OrderModel
from compliance_api.models.order import OrderInspectionRequirementMap as OrderInspectionRequirementMapModel
from compliance_api.models.order import OrderProgressEnum
from compliance_api.models.order_approval import OrderApproval as OrderApprovalModel
from compliance_api.models.project import Project as ProjectModel
from compliance_api.models.staff_user import StaffUser as StaffUserModel
from compliance_api.models.warning_letter import \
    WarningLetterInspectionRequirementMap as WarningLetterInspectionRequirementMapModel
from compliance_api.models.warning_letter_approval import WarningLetterApproval as WarningLetterApprovalModel
from compliance_api.schemas.inspection_requirement_grid import InspectionRequirementGridItemSchema
from compliance_api.services.document_service.doc_service import DocService
from compliance_api.services.document_service.doc_service_enum import ActionOnFileEnum

from .service_utils import ServiceUtils


class InspectionRequirementService:
    """Service for inspection requirement operations."""

    @classmethod
    def get_all_inspection_requirements(cls, args):
        """Get all inspection requirements with filtering and pagination."""
        paginated_query, total_count = _build_inspection_requirements_base_query(
            args, enable_pagination=True
        )
        query_results = paginated_query.all()

        # Process results
        processed_requirements = _process_inspection_requirement_query_results(
            query_results
        )
        # Create final formatted response
        requirement_details = _make_requirement_detail_object(processed_requirements)
        return requirement_details, total_count

    @classmethod
    def generate_inspection_requirements_excel(cls, args):
        """Generate inspection requirements excel."""
        base_query = _build_inspection_requirements_base_query(args)
        query_results = base_query.all()

        # Process the results to include primary officer name and project name
        processed_requirements = _process_inspection_requirement_query_results(
            query_results
        )

        # Create final formatted response and convert to pandas DataFrame
        requirement_details = _make_requirement_detail_object(processed_requirements)
        requirements_data = InspectionRequirementGridItemSchema(many=True).dump(
            requirement_details
        )

        # Use json_normalize to flatten nested structures
        data_frame = pd.json_normalize(requirements_data)

        # Create Excel file in memory
        output = BytesIO()

        # Print columns for debugging
        print(f"Available columns: {data_frame.columns.tolist()}")

        # Preferred columns and their display names (headers)
        # We'll only use columns that actually exist in the dataframe
        preferred_columns = [
            ("topic.name", "Topic"),
            ("summary", "Summary"),
            ("compliance_finding.name", "Compliance Finding"),
            ("enforcement_action.name", "Enforcement Action"),
            ("approval_status.name", "Approval Status"),
            ("requirement_number", "Condition #"),
            ("requirement_source.name", "Requirement Source"),
            ("ir_number", "IR Number"),
            ("date_issued", "Date Issued"),
            ("primary_officer.name", "Primary Officer"),
            ("project.name", "Project"),
            ("inspection_status.name", "Inspection Status"),
        ]

        # Filter for columns that actually exist in the DataFrame
        existing_columns = []
        headers = []

        for col, header in preferred_columns:
            if col in data_frame.columns:
                existing_columns.append(col)
                headers.append(header)

        # Create Excel writer and export the data
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            data_frame.to_excel(
                writer,
                sheet_name="Inspection Requirements",
                columns=existing_columns,
                header=headers,
                index=False,
            )
        output.seek(0)
        return output.getvalue()

    @classmethod
    def get_all(cls, inspection_id):
        """Get all requirements by inspection id."""
        ServiceUtils.inspection_exist_check(inspection_id)
        return InspectionRequirementModel.get_by_inspection_id(inspection_id)

    @classmethod
    def get_by_id(cls, inspection_id, requirement_id):
        """Get inspection requirement by id."""
        ServiceUtils.inspection_exist_check(inspection_id)
        return InspectionRequirementModel.find_by_id(requirement_id)

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
        return images

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


def _get_latest_approval_sub_query():
    """Get latest approval sub query."""
    return (
        db.session.query(
            InspectionRecordApprovalModel.inspection_record_id,
            func.max(InspectionRecordApprovalModel.id).label("max_id"),
        )
        .filter(
            InspectionRecordApprovalModel.is_active.is_(True),
            InspectionRecordApprovalModel.is_deleted.is_(False),
        )
        .group_by(InspectionRecordApprovalModel.inspection_record_id)
        .subquery("latest_approval")
    )


def _get_first_requirement_source_sub_query():
    """Get first requirement source sub query."""
    return (
        db.session.query(
            InspectionReqSourceDetailModel.requirement_id,
            func.min(InspectionReqSourceDetailModel.id).label("min_id"),
        )
        .filter(
            InspectionReqSourceDetailModel.is_active.is_(True),
            InspectionReqSourceDetailModel.is_deleted.is_(False),
        )
        .group_by(InspectionReqSourceDetailModel.requirement_id)
        .subquery("first_requirement_source")
    )


def _get_requirement_order_sub_query():
    """Get requirement order sub query."""
    return (
        db.session.query(
            OrderInspectionRequirementMapModel.inspection_requirement_id,
            OrderInspectionRequirementMapModel.order_id,
        )
        .join(
            OrderModel,
            OrderModel.id == OrderInspectionRequirementMapModel.order_id,
        )
        .filter(
            OrderInspectionRequirementMapModel.is_active.is_(True),
            OrderInspectionRequirementMapModel.is_deleted.is_(False),
            OrderModel.is_active.is_(True),
            OrderModel.is_deleted.is_(False),
        )
        .subquery("requirement_order")
    )


def _get_requirement_warning_letter_sub_query():
    """Get requirement warning letter sub query."""
    return (
        db.session.query(
            WarningLetterInspectionRequirementMapModel.inspection_requirement_id,
            WarningLetterInspectionRequirementMapModel.warning_letter_id,
        )
        .join(
            WarningLetterModel,
            WarningLetterModel.id
            == WarningLetterInspectionRequirementMapModel.warning_letter_id,
        )
        .filter(
            WarningLetterInspectionRequirementMapModel.is_active.is_(True),
            WarningLetterInspectionRequirementMapModel.is_deleted.is_(False),
            WarningLetterModel.is_active.is_(True),
            WarningLetterModel.is_deleted.is_(False),
        )
        .subquery("requirement_warning_letter")
    )


def _build_inspection_requirements_base_query(
    args: dict, enable_pagination: bool = False
):  # pylint: disable=too-many-locals
    """Build inspection requirements base query."""
    # Gets the latest inspection approval entry
    latest_approval_subq = _get_latest_approval_sub_query()
    # Gets the first requirement source entry
    first_requirement_source_subq = _get_first_requirement_source_sub_query()
    # Gets the requirement order entries
    requirement_order_subq = _get_requirement_order_sub_query()
    # Gets the requirement warning letter entries
    requirement_warning_letter_subq = _get_requirement_warning_letter_sub_query()

    # Create aliases for clarity
    req = aliased(InspectionRequirementModel)
    insp = aliased(InspectionModel)
    enf_map = aliased(InspectionReqEnforcementMapModel)
    insp_rec = aliased(InspectionRecordModel)
    approval = aliased(InspectionRecordApprovalModel)
    req_source = aliased(InspectionReqSourceDetailModel)
    enf_action = aliased(EnforcementActionOptionModel)
    staff = aliased(StaffUserModel)
    case_file = aliased(CaseFileModel)
    project = aliased(ProjectModel)
    order_app = aliased(OrderApprovalModel)
    warning_app = aliased(WarningLetterApprovalModel)
    order = aliased(OrderModel)

    # Build a more explicit query with distinct rows
    base_query = (
        db.session.query(
            req,
            approval.approved_by_id,
            insp.ir_number,
            insp_rec.date_issued,
            enf_map.enforcement_action_id,
            enf_action.name.label("enforcement_action_name"),
            staff.id,
            staff.first_name,
            staff.last_name,
            staff.auth_user_guid,
            project.id,
            project.name,
            insp.inspection_status,
            order_app.approval_status,
            warning_app.approval_status,
        )
        .join(
            insp,
            and_(
                insp.id == req.inspection_id,
                insp.is_deleted.is_(False),
                insp.is_active.is_(True),
            ),
        )
        .join(
            enf_map,
            and_(
                enf_map.requirement_id == req.id,
                enf_map.is_deleted.is_(False),
                enf_map.is_active.is_(True),
            ),
        )
        .join(
            enf_action,
            and_(
                enf_action.id == enf_map.enforcement_action_id,
                enf_action.is_deleted.is_(False),
                enf_action.is_active.is_(True),
            ),
        )
        .outerjoin(
            insp_rec,
            and_(
                insp_rec.inspection_id == req.inspection_id,
                insp_rec.is_deleted.is_(False),
                insp_rec.is_active.is_(True),
            ),
        )
        .outerjoin(
            latest_approval_subq,
            latest_approval_subq.c.inspection_record_id == insp_rec.id,
        )
        .outerjoin(
            approval,
            and_(
                approval.inspection_record_id == insp_rec.id,
                approval.id == latest_approval_subq.c.max_id,
                approval.is_deleted.is_(False),
                approval.is_active.is_(True),
            ),
        )
        .outerjoin(
            first_requirement_source_subq,
            first_requirement_source_subq.c.requirement_id == req.id,
        )
        .outerjoin(
            req_source,
            and_(
                req_source.requirement_id == req.id,
                req_source.id == first_requirement_source_subq.c.min_id,
                req_source.is_deleted.is_(False),
                req_source.is_active.is_(True),
            ),
        )
        .outerjoin(
            requirement_order_subq,
            requirement_order_subq.c.inspection_requirement_id == req.id,
        )
        .outerjoin(
            order,
            order.id == requirement_order_subq.c.order_id,
        )
        .outerjoin(
            order_app,
            and_(
                order_app.order_id == requirement_order_subq.c.order_id,
                order_app.is_deleted.is_(False),
                order_app.is_active.is_(True),
            ),
        )
        .outerjoin(
            requirement_warning_letter_subq,
            requirement_warning_letter_subq.c.inspection_requirement_id == req.id,
        )
        .outerjoin(
            warning_app,
            and_(
                warning_app.warning_letter_id
                == requirement_warning_letter_subq.c.warning_letter_id,
                warning_app.is_deleted.is_(False),
                warning_app.is_active.is_(True),
            ),
        )
        .outerjoin(
            staff,
            and_(
                staff.id == insp.primary_officer_id,
                staff.is_deleted.is_(False),
                staff.is_active.is_(True),
            ),
        )
        .outerjoin(
            case_file,
            and_(
                case_file.id == insp.case_file_id,
                case_file.is_deleted.is_(False),
                case_file.is_active.is_(True),
            ),
        )
        .outerjoin(
            project,
            and_(
                project.id == case_file.project_id,
                project.is_deleted.is_(False),
                project.is_active.is_(True),
            ),
        )
        .filter(req.is_active.is_(True), req.is_deleted.is_(False))
    )

    # Apply filters based on query parameters
    base_query = _apply_filters(
        base_query,
        args,
        req,
        insp,
        enf_map,
        req_source,
        insp_rec,
        order_app,
        warning_app,
        order,
    )
    # Apply pagination if requested
    if enable_pagination:
        return _apply_pagination(base_query, args, req, enf_map)
    return base_query


def _apply_filters(
    query, args, req, insp, enf_map, req_source, insp_rec, order_app, warning_app, order
):  # pylint: disable=too-many-arguments
    """Apply filters to the query based on arguments.

    Args:
        query: The SQLAlchemy query to filter
        args: Query arguments containing filter parameters
        req, insp, enf_map, req_source, insp_rec, order_app, warning_app, order: Model aliases

    Returns:
        Filtered SQLAlchemy query
    """
    # Topic IDs filter
    if args.get("tpc_ids"):
        query = query.filter(req.topic_id.in_(args["tpc_ids"].split(",")))

    # Summary text search filter
    if args.get("summary"):
        search_term = args["summary"].lower().strip()
        query = query.filter(func.lower(req.summary).contains(search_term))

    # Compliance finding IDs filter
    if args.get("cmd_fnd_ids"):
        query = query.filter(
            req.compliance_finding_id.in_(args["cmd_fnd_ids"].split(","))
        )

    # Enforcement action IDs filter
    if args.get("enf_actn_ids"):
        query = query.filter(
            enf_map.enforcement_action_id.in_(args["enf_actn_ids"].split(","))
        )

    # Requirement source IDs filter
    if args.get("req_src_ids"):
        query = query.filter(
            req_source.requirement_source_id.in_(args["req_src_ids"].split(","))
        )

    # IR number filter
    if args.get("ir_no") and args.get("ir_no").strip():
        query = query.filter(insp.ir_number.ilike(f'%{args["ir_no"]}%'))

    # Approval status filter
    if args.get("apprv_sts"):
        approval_status = [st.upper().strip() for st in args["apprv_sts"].split(",")]
        query = query.filter(
            or_(
                order_app.approval_status.in_(approval_status),
                warning_app.approval_status.in_(approval_status),
            )
        )

    # Primary officer IDs filter
    if args.get("prm_offc_ids"):
        query = query.filter(
            insp.primary_officer_id.in_(args["prm_offc_ids"].split(","))
        )

    # Inspection status filter
    if args.get("insp_sts"):
        inspection_status = [st.upper().strip() for st in args["insp_sts"].split(",")]
        query = query.filter(insp.inspection_status.in_(inspection_status))

    # Project IDs filter
    if args.get("project_ids"):
        query = query.filter(insp.project_id.in_(args["project_ids"].split(",")))

    # Date issued filter
    if args.get("date_issued"):
        # Extract only the date part from the datetime field
        query = query.filter(func.date(insp_rec.date_issued) == args["date_issued"])

    # Requirement source number filter
    if args.get("req_src_num"):
        query = query.filter(
            or_(
                req_source.section_number.in_(args["req_src_num"].split(",")),
                req_source.clause_number.in_(args["req_src_num"].split(",")),
                req_source.condition_number.in_(args["req_src_num"].split(",")),
                order.order_number.in_(args["req_src_num"].split(",")),
            )
        )

    return query


def _apply_pagination(query, args, req, enf_map):
    """Apply pagination to the query.

    Args:
        query: The SQLAlchemy query to paginate
        args: Query arguments containing pagination parameters
        req: InspectionRequirement model alias
        enf_map: InspectionReqEnforcementMap model alias

    Returns:
        Tuple of (paginated_query, total_count)
    """
    page = int(args.get("page_no", 1))
    per_page = int(args.get("page_size", 15))

    # Get distinct count by requirement ID to avoid duplicates
    distinct_count_query = query.with_entities(
        req.id, enf_map.enforcement_action_id
    ).distinct()
    total_count = distinct_count_query.count()

    # Apply pagination with distinct to avoid duplicate requirements
    paginated_query = (
        query.distinct(req.id, enf_map.enforcement_action_id)
        .order_by(req.id)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return paginated_query, total_count


def _process_inspection_requirement_query_results(query_results):
    """Process inspection requirement query results."""
    # Process results
    processed_requirements = []
    for result in query_results:
        requirement = result[0]
        item = {
            "id": requirement.id,
            "topic": requirement.topic,
            "summary": requirement.summary,
            "compliance_finding": requirement.compliance_finding,
            "sort_order": requirement.sort_order,
            "requirement_source_details": requirement.requirement_source_details,
        }
        # Add additional attributes to the requirement object
        item["approved_by_id"] = result[1]
        item["ir_number"] = result[2]
        item["date_issued"] = result[3]
        # Create a simple dict with enforcement action data
        item["enforcement_action"] = {"id": result[4], "name": result[5]}

        # Add primary officer full name
        item["primary_officer"] = {
            "id": result[6],
            "first_name": result[7] or "",
            "last_name": result[8] or "",
            "auth_user_guid": result[9],
        }

        # Add project name
        item["project"] = {
            "id": result[10],
            "name": result[11],
        }
        item["inspection_status"] = result[12]
        item["order_approval_status"] = result[13]
        item["warning_letter_approval_status"] = result[14]
        processed_requirements.append(item)
    return processed_requirements


def _make_requirement_detail_object(requirements: list):
    """Make requirement detail object."""
    requirement_details = []
    for requirement in requirements:
        item = {
            "id": requirement["id"],
            "topic": requirement["topic"],
            "summary": requirement["summary"],
            "approved_by_id": requirement["approved_by_id"],
            "sort_order": requirement["sort_order"],
            "ir_number": requirement["ir_number"],
            "date_issued": (
                datetime.strftime(requirement["date_issued"], "%Y-%m-%d")
                if requirement["date_issued"]
                else None
            ),
            "compliance_finding": requirement["compliance_finding"],
            "enforcement_action": requirement["enforcement_action"],
            "primary_officer": requirement["primary_officer"],
            "project": requirement["project"],
            "inspection_status": {
                "id": requirement["inspection_status"].name,
                "name": requirement["inspection_status"].value,
            },
        }
        approval_status = (
            requirement["order_approval_status"]
            or requirement["warning_letter_approval_status"]
        )
        if approval_status:
            item["approval_status"] = {
                "id": approval_status.name,
                "name": approval_status.value,
            }
        if requirement["requirement_source_details"]:
            first_requirement_details = requirement["requirement_source_details"][0]
            number_field = ServiceUtils.get_requirement_source_number_field(
                first_requirement_details
            )
            item["requirement_number"] = (
                number_field.split(" ")[1] if number_field else None
            )
            item["requirement_source"] = first_requirement_details.requirement_source
        requirement_details.append(item)
    return requirement_details


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
        # If the removed enforcement action is either ORDER or WARNING LETTER, then check if
        # the order or warning letter is in DRAFTING status. If not, throw validation error.
        # If the order or warning letter is in DRAFTING status, then delete the order or warning letter.
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
                order.order_progress != OrderProgressEnum.DRAFTING
                for order in requirement_orders
            ):
                raise UnprocessableEntityError(
                    "You cannot change enforcement action as order exists and is not in DRAFTING status."
                )
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
                warning.progress != WarningLetterProgressEnum.DRAFTING
                for warning in requirement_warnings
            ):
                raise UnprocessableEntityError(
                    "You cannot change enforcement action as warning letter exists and is not in DRAFTING status."
                )

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
        "clause_number": requirement_source_data.get("clause_number", None),
        "regulation_number": requirement_source_data.get("regulation_number", None),
        "compliance_number": requirement_source_data.get("compliance_number", None),
        "source_title": requirement_source_data.get("source_title", None),
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
