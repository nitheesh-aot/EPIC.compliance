"""Order Service."""

from typing import List

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models.case_file import CaseFile as CaseFileModel
from compliance_api.models.db import session_scope
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.order import Order as OrderModel
from compliance_api.models.order import OrderInspectionRequirementMap as OrderInspectionRequirementMapModel
from compliance_api.models.order import OrderProgressEnum, OrderStatusEnum
from compliance_api.models.section import Section as SectionModel
from compliance_api.services.epic_track_service.track_service import TrackService
from compliance_api.services.service_utils import ServiceUtils
from compliance_api.utils.constant import UNAPPROVED_PROJECT_CODE
from compliance_api.utils.template_renderer import render_template_with_data

from .order_constant import DEFAULT_ACT, DEFAULT_SECTION
from .order_template_constant import NOW_THEREFORE, WHERE_AS


class OrderService:
    """Service layer for Order operations."""

    @classmethod
    def get_all(cls, inspection_id: int) -> List[OrderModel]:
        """Get all orders for an inspection."""
        return OrderModel.get_by_params(
            {"inspection_id": inspection_id}, default_filters=False
        )

    @classmethod
    def create_order(cls, inspection_id: int, order_data: dict) -> OrderModel:
        """Create a new order."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirement_ids = order_data.get("inspection_requirement_ids", [])
        if OrderModel.does_order_exists_by_requirement_ids(requirement_ids):
            raise UnprocessableEntityError(
                "Order already exists for these requirements."
            )
        order_obj = _create_order_obj(inspection, order_data)
        with session_scope() as session:
            created_order = OrderModel.create(order_obj, session)
            cls.insert_or_update_inspection_requirements(
                created_order.id,
                order_data.get("inspection_requirement_ids", []),
                session,
            )
        return created_order

    @classmethod
    def get_order(cls, inspection_id: int, order_id: int) -> OrderModel:
        """Retrieve an order by ID."""
        ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        return OrderModel.find_by_id(order_id)

    @classmethod
    def get_order_by_order_number(
        cls, inspection_id: int, order_number: str
    ) -> OrderModel:
        """Retrieve an order by order number."""
        ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        return OrderModel.get_by_order_number(order_number)

    @classmethod
    def update_order(
        cls, inspection_id: int, order_id: int, update_data: dict
    ) -> OrderModel:
        """Update an existing order."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirement_ids = update_data.get("inspection_requirement_ids", [])
        if OrderModel.does_order_exists_by_requirement_ids(requirement_ids, order_id):
            raise UnprocessableEntityError(
                "Order already exists for these requirements."
            )
        with session_scope() as session:
            updated_order = OrderModel.update_order(order_id, update_data, session)
            cls.insert_or_update_inspection_requirements(
                updated_order.id,
                update_data.get("inspection_requirement_ids", []),
                session,
            )
        return updated_order

    @classmethod
    def delete_order(cls, inspection_id: int, order_id: int) -> None:
        """Delete an order by ID."""
        order = cls.get_order(inspection_id, order_id)
        if order:
            order.delete()

    @classmethod
    def insert_or_update_inspection_requirements(
        cls, order_id: int, inspection_requirement_ids: list[int], session=None
    ):
        """Insert/Update inspection requirements associated with a given order."""
        if inspection_requirement_ids is not None:
            existing_requirements = OrderInspectionRequirementMapModel.get_by_order_id(
                order_id
            )
            existing_requirement_ids = {
                req.inspection_requirement_id for req in existing_requirements
            }

            new_requirement_ids = set(inspection_requirement_ids)
            requirement_ids_to_be_deleted = existing_requirement_ids.difference(
                new_requirement_ids
            )
            requirement_ids_to_be_added = new_requirement_ids.difference(
                existing_requirement_ids
            )

            if requirement_ids_to_be_deleted:
                OrderInspectionRequirementMapModel.bulk_delete(
                    order_id, list(requirement_ids_to_be_deleted), session
                )
            if requirement_ids_to_be_added:
                OrderInspectionRequirementMapModel.bulk_insert(
                    order_id, list(requirement_ids_to_be_added), session
                )

    @classmethod
    def change_status(cls, inspection_id, order_id, status):
        """Close the order."""
        order = OrderModel.find_by_id(order_id)
        if not order:
            raise ResourceNotFoundError(f"Order with ID {order_id} not found")
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        status_enum = OrderStatusEnum(status.get("status"))
        if order.order_status == status_enum:
            raise UnprocessableEntityError(
                "The order is already in the requested status"
            )
        possible_status_change = {
            OrderStatusEnum.OPEN: [OrderStatusEnum.CLOSED, OrderStatusEnum.RESCINDED],
            OrderStatusEnum.CLOSED: [OrderStatusEnum.OPEN],
        }
        if status_enum not in possible_status_change.get(order.order_status, []):
            raise UnprocessableEntityError("Invalid status change requested")
        updated_order = OrderModel.update_order(
            order_id,
            {"order_status": OrderStatusEnum(status_enum.value)},
        )
        return updated_order

    @classmethod
    def issue_order(cls, inspection_id, order_id, issue):
        """Issue an order."""
        order = OrderModel.find_by_id(order_id)
        if not order:
            raise ResourceNotFoundError(f"Order with ID {order_id} not found")
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        OrderModel.update_order(
            order_id,
            {
                "order_status": OrderStatusEnum.OPEN,
                "order_progress": OrderProgressEnum.ISSUED,
                "date_issued": issue.get("date_issued"),
            },
        )
        return order


def _create_order_obj(inspection, order_data: dict) -> dict:
    """
    Create an order object as a dictionary.

    If where_as and now_therefore are not provided, they will be generated.
    If issuing_officer_id is not provided, it will be set to the primary officer of the inspection.
    If section_id is not provided, it will be set to the default section.
    """
    section_id = order_data.get("section_id", None)
    if not section_id:
        default_section = SectionModel.get_by_name_act(DEFAULT_SECTION, DEFAULT_ACT)
        section_id = default_section.id
    order_number = order_data.get("order_number", None)
    if not order_number:
        order_number = _create_order_number(
            inspection.case_file.project_id, inspection.case_file.id
        )
    where_as = order_data.get("where_as")
    now_therefore = order_data.get("now_therefore")
    if not where_as or not now_therefore:
        generated_where_as, generated_now_therefore = (
            _create_where_as_and_now_therefore(inspection, order_number, section_id)
        )
        where_as = where_as or generated_where_as
        now_therefore = now_therefore or generated_now_therefore
    return {
        "order_number": order_number,
        "inspection_id": inspection.id,
        "issuing_officer_id": order_data.get(
            "issuing_officer_id", inspection.primary_officer_id
        ),
        "section_id": section_id,
        "where_as": where_as,
        "now_therefore": now_therefore,
        "intended_issuance_date": order_data.get("intended_issuance_date"),
        "order_status": OrderStatusEnum.CREATED,
        "order_progress": OrderProgressEnum.DRAFTING,
    }


def _create_where_as_and_now_therefore(inspection, order_number, section_id):
    """Create where_as and now_therefore."""
    section = SectionModel.find_by_id(section_id)
    whereas_data = {
        "project_details": ServiceUtils.get_project_details(
            inspection.case_file.project_id, inspection.case_file.id
        ),
        "inspection_details": {
            "id": inspection.id,
            "inspection_type": " and ".join(
                [inspection_type.type.name for inspection_type in inspection.types]
            ),
            "start_date": inspection.start_date.strftime("%Y-%m-%d"),
            "end_date": (
                inspection.end_date.strftime("%Y-%m-%d") if inspection.end_date else ""
            ),
            "ir_number": inspection.ir_number,
        },
        "order_details": {
            "order_number": order_number,
            "section": section.name,
        },
    }
    inspection_record = InspectionRecordModel.get_by_inspection_id(inspection.id)
    requirements = InspectionRequirementModel.get_by_inspection_id(inspection.id)
    requirement_details = ServiceUtils.get_formatted_requirement_details(
        requirements, inspection_record.ir_status_id
    )
    requirement_numbers = []
    requirement_summaries = []
    requirement_sources = []
    for requirement in requirement_details:
        requirement_summaries.append(requirement["requirement_summary"])
        for detail in requirement["requirement_source_details"]:
            requirement_sources.append(detail["requirement_source_name"])
            requirement_numbers.append(detail["requirement_source_number"])
            # break after first requirement source detail
            break
    whereas_data["requirement_details"] = {
        "requirement_numbers": ", ".join(requirement_numbers),
        "requirement_summaries": ", ".join(requirement_summaries),
        "requirement_sources": ", ".join(requirement_sources),
    }

    where_as = render_template_with_data("WHERE_AS", WHERE_AS, whereas_data)
    now_therefore = render_template_with_data(
        "NOW_THEREFORE", NOW_THEREFORE, whereas_data
    )
    return where_as, now_therefore


def _create_order_number(project_id: int, case_file_id: int) -> str:
    """Generate the order number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileModel.find_by_id(case_file_id)
    if not case_file:
        raise ResourceNotFoundError("Given case file doesn't exist")
    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file don't match")

    count = OrderModel.get_count_by_project_nd_case_file_id(project_id, case_file_id)
    serial_number = f"{count + 1:04}"
    return f"{project_code}_{case_file.case_file_number}_OR{serial_number}"


def _get_project_abbreviation(
    project_id: int,
):  # pylint: disable=inconsistent-return-statements
    """Return the project abbreviation."""
    if project_id:
        project = TrackService.get_project_by_id(project_id)
        return project.get("abbreviation")
    return UNAPPROVED_PROJECT_CODE
