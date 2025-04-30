"""Order Service."""

from typing import List

from compliance_api.models.db import session_scope
from compliance_api.models.order import OrderInspectionRequirementMap as OrderInspectionRequirementMapModel
from compliance_api.services.epic_track_service.track_service import TrackService
from compliance_api.services.service_utils import ServiceUtils

from ..exceptions import ResourceNotFoundError, UnprocessableEntityError
from ..models.case_file import CaseFile as CaseFileModel
from ..models.order import Order
from ..utils.constant import UNAPPROVED_PROJECT_CODE


class OrderService:
    """Service layer for Order operations."""

    @classmethod
    def get_all(cls, inspection_id: int) -> List[Order]:
        """Get all orders for an inspection."""
        return Order.get_by_params(
            {"inspection_id": inspection_id}, default_filters=False
        )

    @classmethod
    def create_order(cls, inspection_id: int, order_data: dict) -> Order:
        """Create a new order."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        order_obj = _create_order_obj(inspection, order_data)
        with session_scope() as session:
            created_order = Order.create(order_obj, session)
            cls.insert_or_update_inspection_requirements(
                created_order.id,
                order_data.get("inspection_requirement_ids", []),
                session,
            )
        return created_order

    @classmethod
    def get_order(cls, order_id: int) -> Order:
        """Retrieve an order by ID."""
        return Order.find_by_id(order_id)

    @classmethod
    def update_order(cls, order_id: int, update_data: dict) -> Order:
        """Update an existing order."""
        order = cls.get_order(order_id)
        if order:
            order.update(update_data)
        return order

    @classmethod
    def delete_order(cls, order_id: int) -> None:
        """Delete an order by ID."""
        order = cls.get_order(order_id)
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


def _create_order_obj(inspection, order_data: dict) -> dict:
    """Create an order object as a dictionary."""
    order_number = _create_order_number(
        inspection.case_file.project_id, inspection.case_file.id
    )
    return {
        "order_number": order_number,
        "inspection_id": inspection.id,
        "issuing_officer_id": order_data.get("issuing_officer_id"),
        "section_id": order_data.get("section_id"),
        "where_as": order_data.get("where_as"),
        "now_therefore": order_data.get("now_therefore"),
        "intended_issuance_date": order_data.get("intended_issuance_date"),
    }


def _create_order_number(project_id: int, case_file_id: int) -> str:
    """Generate the order number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileModel.find_by_id(case_file_id)
    if not case_file:
        raise ResourceNotFoundError("Given case file doesn't exist")
    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file don't match")

    count = Order.get_count_by_project_and_case_file_id(project_id, case_file_id)
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
