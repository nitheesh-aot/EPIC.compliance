"""Service method to handle order approval."""

from datetime import datetime, timedelta

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import Order as OrderModel
from compliance_api.models import OrderApproval as OrderApprovalModel
from compliance_api.models import OrderApprovalStatusEnum, OrderProgressEnum
from compliance_api.models.db import session_scope
from compliance_api.models.inspection_record import IRStatusEnum
from compliance_api.models.order import OrderStatusEnum

from ..service_utils import ServiceUtils


class OrderApprovalService:
    """Service for order approval."""

    @classmethod
    def create_approval(
        cls,
        order_approval_request_data: dict,
        inspection_id: int,
        order_id: int,
    ):
        """Create approval for the order."""
        ServiceUtils.inspection_exist_check(inspection_id)
        order = _order_exist_check(order_id)
        approval_data = {
            "order_id": order_id,
            "approved_by_id": order_approval_request_data.get("approved_by_id"),
            "order_status_id": OrderStatusEnum.CREATED,  # default status
            "approval_status": OrderApprovalStatusEnum.DECISION_PENDING,  # default status
        }
        # No more approval request can be made if the order is in the following statuses
        if order.order_progress in {
            OrderProgressEnum.ISSUED,
            OrderProgressEnum.APPROVED,
        }:
            raise UnprocessableEntityError(
                f"New approval request cannot be perforemed as the order already in {order.order_progress.value}"
            )
        latest_approval = OrderApprovalModel.get_latest_approval_by_order(
            order_id
        )
        # No more approval request can be made if the latest approval is in progress
        if (
            latest_approval
            and latest_approval.approval_status == OrderApprovalStatusEnum.DECISION_PENDING
        ):
            raise UnprocessableEntityError(
                "New request cannot be made as the existing one is in progress"
            )
        with session_scope() as session:
            created_approval = (
                OrderApprovalModel.create_order_approval(
                    approval_data, session=session
                )
            )
            # Update order_progress to either PRELIMINARY_DEPUTY_REVIEW or FINAL_DEPUTY_REVIEW
            OrderModel.update_order(
                order_id=order_id,
                order_update_data={
                    "order_progress": OrderProgressEnum.DEPUTY_REVIEW
                },
                session=session,
            )
        return created_approval

    @classmethod
    def get_all_approvals(cls, order_id: int):
        """Find all order approvals by order_id."""
        return OrderApprovalModel.get_approvals_by_order(order_id)

    # @classmethod
    # def update_approval(
    #     cls, inspection_id, order_id, approval_id, approval_update_data
    # ):
    #     """Update order approval."""
    #     field_name = approval_update_data.get("field_name")
    #     value = approval_update_data.get("value", None)
    #     approval_update_data = {field_name: value}
    #     inspection = ServiceUtils.inspection_exist_check(inspection_id)
    #     order = _order_exist_check(order_id)
    #     ServiceUtils.access_check_update_for_inspection(inspection)
    #     latest_approval = OrderApprovalModel.get_latest_approval_by_order(
    #         order_id
    #     )
    #     if latest_approval.id != approval_id:
    #         raise UnprocessableEntityError(
    #             "Given approval id does not match the latest approval request"
    #         )

    #     # Calculate date_expected_return if date_report_sent is updated
    #     if field_name == "date_report_sent" and value:
    #         date_report_sent = value
    #         date_expected_return = datetime.strptime(
    #             date_report_sent, "%Y-%m-%dT%H:%M:%S.%fZ"
    #         ) + timedelta(days=5)
    #         approval_update_data["date_expected_return"] = date_expected_return
    #     with session_scope() as session:
    #         updated_approval = OrderApprovalModel.update_approval(
    #             approval_id=approval_id,
    #             approval_update_data=approval_update_data,
    #             session=session,
    #         )
    #         if not updated_approval:
    #             raise ResourceNotFoundError("Approval not found")

    #         # Update order_progress to HOLDER_PRELIMINARY_REVIEW
    #         OrderModel.update_order(
    #             order_id=order_id,
    #             order_update_data={
    #                 "order_progress": OrderProgressEnum.HOLDER_PRELIMINARY_REVIEW
    #             },
    #             session=session,
    #         )

    #     return updated_approval

    @classmethod
    def update_approval_status(
        cls, inspection_id, inspection_record_id, approval_id, approval_status_data
    ):
        """Update approval status."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_record_exist_check(inspection_record_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        latest_approval = OrderApprovalModel.get_latest_approval_by_order(
            order_id
        )
        # Check if the update request for the approval is not the latest approval request
        if latest_approval.id != approval_id:
            raise UnprocessableEntityError(
                "Given approval id does not match the latest approval request"
            )
        # Check if the approval status is already in the status to be updated
        status_to_be_updated = approval_status_data.get("approval_status")
        if latest_approval.approval_status == status_to_be_updated:
            raise UnprocessableEntityError(
                f"Approval already in {status_to_be_updated.value} status"
            )
        with session_scope() as session:
            updated_approval = OrderApprovalModel.update_approval(
                approval_id=approval_id,
                approval_update_data=approval_status_data,
                session=session,
            )
            # Update the order progress to PRELIMINARY_APPROVED or FINAL_APPROVED
            if status_to_be_updated == OrderApprovalStatusEnum.APPROVED:
                order_progress = (
                    OrderProgressEnum.PRELIMINARY_APPROVED
                    if latest_approval.order_status_id == OrderStatusEnum.PRELIMINARY.value
                    else OrderProgressEnum.FINAL_APPROVED
                )
            # If not approved, the IR progress is set to the drafting status
            if status_to_be_updated == OrderApprovalStatusEnum.NOT_APPROVED:
                order_progress = (
                    OrderProgressEnum.PRELIMINARY_DRAFTING
                    if latest_approval.order_status_id == OrderStatusEnum.PRELIMINARY.value
                    else OrderProgressEnum.FINALIZING_RECORD
                )
            OrderModel.update_order(
                order_id=order_id,
                ir_update_data={"ir_progress": ir_progress},
                session=session,
            )

        return updated_approval

def _order_exist_check(order_id):
    order = OrderModel.find_by_id(order_id)
    if not order:
        raise ResourceNotFoundError(f"Order with ID {order_id} not found")
    return order
