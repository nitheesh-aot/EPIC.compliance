"""Service method to handle inspection record approval."""

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models import IRApprovalStatusEnum, IRProgressEnum

from ..service_utils import ServiceUtils


class InspectionRecordApprovalService:
    """Service for inspection record approval."""

    @classmethod
    def create_approval(
        cls,
        ir_approval_request_data: dict,
        inspection_id: int,
        inspection_record_id: int,
    ):
        """Create approval for the inspection record."""
        ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        approval_data = {
            "inspection_record_id": inspection_record_id,
            "approved_by_id": ir_approval_request_data.get("approved_by_id"),
            "ir_status_id": inspection_record.ir_status_id,
            "approval_status": IRApprovalStatusEnum.DECISION_PENDING,
        }
        if inspection_record.ir_progress in {
            IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW,
            IRProgressEnum.FINAL_DEPUTY_REVIEW,
            IRProgressEnum.ISSUED,
            IRProgressEnum.FINAL_APPROVED,
        }:
            raise UnprocessableEntityError(
                f"New approval request cannot be perforemed as the IR already in {inspection_record.ir_progress.value}"
            )
        latest_approval = InspectionRecordApprovalModel.get_latest_approval_by_ir(
            inspection_record_id
        )
        if (
            latest_approval
            and latest_approval.approval_status == IRApprovalStatusEnum.DECISION_PENDING
        ):
            raise UnprocessableEntityError(
                "New request cannot be made as the existing one is in progress"
            )
        created_approval = (
            InspectionRecordApprovalModel.create_inspection_record_approval(
                approval_data
            )
        )
        return created_approval

    @classmethod
    def get_all_approvals(cls, inspection_record_id: int):
        """Find all inspection record approvals by inspection_record_id."""
        return InspectionRecordApprovalModel.get_approvals_by_ir(inspection_record_id)

    @classmethod
    def update_approval(
        cls, inspection_id, inspection_record_id, approval_id, approval_update_data
    ):
        """Update inspection record approval."""
        field_name = approval_update_data.get("field_name")
        value = approval_update_data.get("value", None)
        approval_update_data = {field_name: value}
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_record_exist_check(inspection_record_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        latest_approval = InspectionRecordApprovalModel.get_latest_approval_by_ir(
            inspection_record_id
        )
        if latest_approval.id != approval_id:
            raise UnprocessableEntityError(
                "Given approval id does not match the latest approval request"
            )
        updated_approval = InspectionRecordApprovalModel.update_approval(
            approval_id=approval_id, approval_update_data=approval_update_data
        )
        if not updated_approval:
            raise ResourceNotFoundError("Approval not found")
        return updated_approval

    @classmethod
    def update_approval_status(cls, inspection_id, inspection_record_id, approval_id, approval_status_data):
        """Update approval status."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_record_exist_check(
            inspection_record_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        latest_approval = InspectionRecordApprovalModel.get_latest_approval_by_ir(
            inspection_record_id
        )
        if latest_approval.id != approval_id:
            raise UnprocessableEntityError(
                "Given approval id does not match the latest approval request"
            )
        status_to_be_updated = approval_status_data.get("approval_status")
        if latest_approval.approval_status == status_to_be_updated:
            raise UnprocessableEntityError(
                f"Approval already in {status_to_be_updated.value} status"
            )
        updated_approval = InspectionRecordApprovalModel.update_approval(
            approval_id=approval_id, approval_update_data={
                "approval_status": status_to_be_updated}
        )
        return updated_approval
