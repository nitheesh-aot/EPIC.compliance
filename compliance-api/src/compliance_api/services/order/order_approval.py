"""Service method to handle order approval."""

from datetime import datetime, timezone

from compliance_api.exceptions import UnprocessableEntityError
from compliance_api.models import Order as OrderModel
from compliance_api.models import OrderApproval as OrderApprovalModel
from compliance_api.models import OrderApprovalStatusEnum, OrderProgressEnum
from compliance_api.models.db import session_scope

from ..service_utils import ServiceUtils


class OrderApprovalService:
    """Service for order approval."""

    @classmethod
    def create_approval(
        cls,
        order_approval_request_data: dict,
        order_id: int,
    ):
        """Create approval for the order."""
        order = ServiceUtils.order_exist_check(order_id)
        ServiceUtils.access_check_update_for_inspection(order.inspection)
        approval_data = {
            "order_id": order_id,
            "approved_by_id": order_approval_request_data.get("approved_by_id"),
            "order_status": order.order_status,  # default status
            "approval_status": OrderApprovalStatusEnum.APPROVAL_PENDING,  # default status
        }
        # No more approval request can be made if the order is in the following statuses
        if order.order_progress in {
            OrderProgressEnum.ISSUED,
            OrderProgressEnum.APPROVED,
        }:
            raise UnprocessableEntityError(
                f"New approval request cannot be perforemed as the order already in {order.order_progress.value}"
            )
        latest_approval = OrderApprovalModel.get_latest_approval_by_order(order_id)
        # No more approval request can be made if the latest approval is in progress
        if (
            latest_approval
            and latest_approval.approval_status
            == OrderApprovalStatusEnum.APPROVAL_PENDING
        ):
            raise UnprocessableEntityError(
                "New request cannot be made as the existing one is in progress"
            )
        with session_scope() as session:
            created_approval = OrderApprovalModel.create_order_approval(
                approval_data, session=session
            )
            # Update order_progress to either PRELIMINARY_DEPUTY_REVIEW or FINAL_DEPUTY_REVIEW
            OrderModel.update_order(
                order_id=order_id,
                order_data={"order_progress": OrderProgressEnum.DEPUTY_REVIEW},
                session=session,
            )
        return created_approval

    @classmethod
    def get_all_approvals(cls, order_id: int):
        """Find all order approvals by order_id."""
        ServiceUtils.order_exist_check(order_id)
        return OrderApprovalModel.get_approvals_by_order(order_id)

    @classmethod
    def update_approval_status(cls, order_id, approval_id, approval_status_data):
        """Update approval status."""
        order = ServiceUtils.order_exist_check(order_id)
        ServiceUtils.access_check_update_for_inspection(order.inspection)
        latest_approval = OrderApprovalModel.get_latest_approval_by_order(order_id)
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
        if status_to_be_updated == OrderApprovalStatusEnum.APPROVED:
            approval_status_data["approved_date"] = datetime.now(timezone.utc)
        with session_scope() as session:
            updated_approval = OrderApprovalModel.update_approval(
                approval_id=approval_id,
                approval_update_data=approval_status_data,
                session=session,
            )
            OrderModel.update_order(
                order_id=order_id,
                order_data={
                    "order_progress": (
                        OrderProgressEnum.APPROVED
                        if status_to_be_updated == OrderApprovalStatusEnum.APPROVED
                        else OrderProgressEnum.DRAFTING
                    )
                },
                session=session,
            )

        return updated_approval
