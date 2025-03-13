"""Service for inspection record."""

from compliance_api.exceptions import ResourceExistsError, UnprocessableEntityError
from compliance_api.models import InspectionRecord as InspectionRecordModel
from compliance_api.models import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models import IRApprovalStatusEnum
from compliance_api.models.inspection_record import IRStatusEnum

from ..service_utils import ServiceUtils
from .inspection_record_builder import InspectionRecordDataBuilder


class InspectionRecordService:
    """InspectionRecordService."""

    @classmethod
    def get_by_inspection_id(cls, inspection_id):
        """Find all inspection records by inspection id."""
        return InspectionRecordModel.get_by_inspection_id(inspection_id)

    @classmethod
    def get_by_id(cls, inspection_record_id):
        """Find inspection record by id."""
        return InspectionRecordModel.find_by_id(inspection_record_id)

    @classmethod
    def create(cls, ir_request_data: dict, inspection_id):
        """Create inspection record."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)

        existing_ir = InspectionRecordModel.get_by_inspection_id(inspection_id)
        #  Raise error, if ir exists and the request is to create another ir of the same status
        if existing_ir:
            raise ResourceExistsError("IR for the given inspection already exists.")

        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection, ir_status=ir_request_data.get("ir_status")
        )
        ir_data = (
            ir_builder.build_inspection_scope()
            .build_preliminary_review_details()
            .build_finding_statement()
            .build_enforcement_summary()
            .build_action_required_by_rp()
            .build()
        )
        ir_obj = _create_ir_object(ir_data)
        created_ir = InspectionRecordModel.create_inspection_record(ir_obj)
        return created_ir

    @classmethod
    def update(cls, inspection_id, inspection_record_id, ir_update_data: dict):
        """Update the inspection record."""
        field_name = ir_update_data.get("field_name")
        value = ir_update_data.get("value", None)
        ir_update_data = {field_name: value}
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.inspection_record_exist_check(inspection_record_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        updated_inspection_record = InspectionRecordModel.update_inspection_record(
            inspection_record_id=inspection_record_id, ir_update_data=ir_update_data
        )
        return updated_inspection_record

    @classmethod
    def switch_to_final(cls, inspection_id, inspection_record_id):
        """Update the IR status to FINAL."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        ServiceUtils.access_check_update(inspection)
        approvals = InspectionRecordApprovalModel.get_approvals_by_ir(
            inspection_record_id=inspection_record_id
        )
        if not approvals:
            raise UnprocessableEntityError("IR cannot be FINAL without approval")
        latest_approval = approvals[0]
        if latest_approval.approval_status != IRApprovalStatusEnum.APPROVED:
            raise UnprocessableEntityError("Pending review for this IR")
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection,
            ir_status=IRStatusEnum.FINAL.value,
            existing_ir=inspection_record,
        )
        ir_data = ir_builder.build_preliminary_review_details().build()


def _create_ir_object(ir_data):
    """
    Create the inspection record object to be persisted.

    :param ir_request_data: The input payload for the endpoint.
    :param ir_data: The inspection record builder output.
    """
    return {
        "inspection_id": ir_data.get("inspection_id"),
        "ir_status_id": ir_data.get("ir_status_id").value,
        "inspection_scope": ir_data.get("inspection_scope"),
        "finding_statement": ir_data.get("finding_statement"),
        "enforcement_summary": ir_data.get("enforcement_summary", None),
        "ir_progress": ir_data.get("ir_progress"),
        "action_required_by_rp": ir_data.get("action_required_by_rp", None),
    }
