"""Service method to handle inspection record approval."""

from datetime import datetime, timedelta

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import InspectionRecord as InspectionRecordModel
from compliance_api.models import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models import IRApprovalStatusEnum, IRProgressEnum
from compliance_api.models.db import session_scope
from compliance_api.models.inspection_record import IRStatusEnum

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
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        ServiceUtils.access_check_update_for_inspection(inspection)
        approval_data = {
            "inspection_record_id": inspection_record_id,
            "approved_by_id": ir_approval_request_data.get("approved_by_id"),
            "ir_status_id": inspection_record.ir_status_id,
            "approval_status": IRApprovalStatusEnum.DECISION_PENDING,  # default status
        }
        # No more approval request can be made if the IR is in the following statuses
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
        # No more approval request can be made if the latest approval is in progress
        if (
            latest_approval
            and latest_approval.approval_status == IRApprovalStatusEnum.DECISION_PENDING
        ):
            raise UnprocessableEntityError(
                "New request cannot be made as the existing one is in progress"
            )
        with session_scope() as session:
            created_approval = (
                InspectionRecordApprovalModel.create_inspection_record_approval(
                    approval_data, session=session
                )
            )
            # Update ir_progress to either PRELIMINARY_DEPUTY_REVIEW or FINAL_DEPUTY_REVIEW
            InspectionRecordModel.update_inspection_record(
                inspection_record_id=inspection_record_id,
                ir_update_data={
                    "ir_progress": (
                        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW
                        if inspection_record.ir_status_id
                        == IRStatusEnum.PRELIMINARY.value
                        else IRProgressEnum.FINAL_DEPUTY_REVIEW
                    )
                },
                session=session,
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

        # Calculate date_expected_return if date_report_sent is updated
        if field_name == "date_report_sent" and value:
            date_report_sent = value
            date_expected_return = datetime.strptime(
                date_report_sent, "%Y-%m-%dT%H:%M:%S.%fZ"
            ) + timedelta(days=5)
            approval_update_data["date_expected_return"] = date_expected_return
        with session_scope() as session:
            updated_approval = InspectionRecordApprovalModel.update_approval(
                approval_id=approval_id,
                approval_update_data=approval_update_data,
                session=session,
            )
            if not updated_approval:
                raise ResourceNotFoundError("Approval not found")

            # Update ir_progress to HOLDER_PRELIMINARY_REVIEW
            InspectionRecordModel.update_inspection_record(
                inspection_record_id=inspection_record_id,
                ir_update_data={
                    "ir_progress": IRProgressEnum.HOLDER_PRELIMINARY_REVIEW
                },
                session=session,
            )

        return updated_approval

    @classmethod
    def update_approval_status(
        cls, inspection_id, inspection_record_id, approval_id, approval_status_data
    ):
        """Update approval status."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_record_exist_check(inspection_record_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        latest_approval = InspectionRecordApprovalModel.get_latest_approval_by_ir(
            inspection_record_id
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
            updated_approval = InspectionRecordApprovalModel.update_approval(
                approval_id=approval_id,
                approval_update_data=approval_status_data,
                session=session,
            )
            # Update the IR progress to PRELIMINARY_APPROVED or FINAL_APPROVED
            if status_to_be_updated == IRApprovalStatusEnum.APPROVED:
                ir_progress = (
                    IRProgressEnum.PRELIMINARY_APPROVED
                    if latest_approval.ir_status_id == IRStatusEnum.PRELIMINARY.value
                    else IRProgressEnum.FINAL_APPROVED
                )
            # If not approved, the IR progress is set to the drafting status
            if status_to_be_updated == IRApprovalStatusEnum.NOT_APPROVED:
                ir_progress = (
                    IRProgressEnum.PRELIMINARY_DRAFTING
                    if latest_approval.ir_status_id == IRStatusEnum.PRELIMINARY.value
                    else IRProgressEnum.FINALIZING_RECORD
                )
            InspectionRecordModel.update_inspection_record(
                inspection_record_id=inspection_record_id,
                ir_update_data={"ir_progress": ir_progress},
                session=session,
            )

        return updated_approval
