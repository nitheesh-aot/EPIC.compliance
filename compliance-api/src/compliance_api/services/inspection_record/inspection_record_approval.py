"""Service method to handle inspection record approval."""

from datetime import datetime

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models import IRApprovalStatusEnum, IRProgressEnum
from compliance_api.models.db import session_scope
from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT
from compliance_api.utils.enum import ContextEnum

from ..continuation_report import ContinuationReportService
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
        with session_scope() as session:
            created_approval = (
                InspectionRecordApprovalModel.create_inspection_record_approval(
                    approval_data, session
                )
            )
            cr_entry_text = f"{inspection_record.ir_status.name} was sent to"
            cr_entry_text += f" {created_approval.approved_by.first_name} "
            cr_entry_text += f"{created_approval.approved_by.last_name} for approval"
            cr_entry = _create_cr_entry(
                inspection,
                cr_entry_text,
            )
            ContinuationReportService.create(
                cr_entry, sys_generated=True, ho_session=session
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
        updated_approval = InspectionRecordApprovalModel.update_approval(
            approval_id=approval_id, approval_update_data=approval_update_data
        )
        if not updated_approval:
            raise ResourceNotFoundError("Approval not found")
        return updated_approval


def _create_cr_entry(inspection: InspectionModel, text: str):
    """Create the continuation report entry."""
    return {
        "case_file_id": inspection.case_file_id,
        "text": text,
        "rich_text": f"<p>{text}</p>",
        "date_created": datetime.utcnow().strftime(INPUT_DATE_TIME_FORMAT),
        "context_type": ContextEnum.INSPECTION,
        "context_id": inspection.id,
        "keys": [{"key": inspection.ir_number, "key_context": ContextEnum.INSPECTION}],
    }
