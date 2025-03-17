"""Service for inspection record."""

from flask import g

from compliance_api.auth import auth
from compliance_api.exceptions import (
    PermissionDeniedError, ResourceExistsError, ResourceNotFoundError, UnprocessableEntityError)
from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.utils.enum import PermissionEnum
from compliance_api.utils.template_renderer import render_template_with_data

from .inspection_record_builder import InspectionRecordDataBuilder
from .ir_template_constant import INSPECTION_SCOPE


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
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise UnprocessableEntityError("Invalid inspection details provided")

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
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError("Inspection not found")
        _access_check_update(inspection)
        inspection_record = InspectionRecordModel.find_by_id(inspection_record_id)
        if not inspection_record:
            raise ResourceNotFoundError("Inspection record not found")
        updated_inspection_record = InspectionRecordModel.update_inspection_record(
            inspection_record_id=inspection_record_id, ir_update_data=ir_update_data
        )
        return updated_inspection_record

    @classmethod
    def reset_field(
        cls, inspection_id: int, inspection_record_id: int, field_name: str
    ):
        """Reset a specific field in the inspection record to its default generated state.

        Args:
            inspection_id: The ID of the inspection
            inspection_record_id: The ID of the inspection record
            field_name: The field to reset (inspection_scope, preliminary_review_details, etc.)

        Returns:
            Updated inspection record object

        Raises:
            ResourceNotFoundError: If inspection or inspection record not found
            PermissionDeniedError: If user doesn't have permission
        """
        # Check if inspection exists
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError("Inspection not found")

        # Check user permissions
        _access_check_update(inspection)

        # Check if inspection record exists
        inspection_record = InspectionRecordModel.find_by_id(inspection_record_id)
        if not inspection_record:
            raise ResourceNotFoundError("Inspection record not found")

        # Create builder with existing inspection and status
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection, ir_status=inspection_record.ir_status
        )

        # Build only the requested field
        if field_name == "inspection_scope":
            ir_data = ir_builder.build_inspection_scope().build()
            update_data = {
                "inspection_scope": render_template_with_data(
                    "INSPECTION_SCOPE",
                    INSPECTION_SCOPE,
                    ir_data.get("inspection_scope"),
                )
            }
        elif field_name == "preliminary_review_details":
            ir_data = ir_builder.build_preliminary_review_details().build()
            update_data = {
                "preliminary_review_details": ir_data.get("preliminary_review_details")
            }
        elif field_name == "finding_statement":
            ir_data = ir_builder.build_finding_statement().build()
            update_data = {"finding_statement": ir_data.get("finding_statement")}
        elif field_name == "enforcement_summary":
            ir_data = ir_builder.build_enforcement_summary().build()
            update_data = {"enforcement_summary": ir_data.get("enforcement_summary")}

        # Update the inspection record with the reset field
        updated_inspection_record = InspectionRecordModel.update_inspection_record(
            inspection_record_id=inspection_record_id, ir_update_data=update_data
        )

        return updated_inspection_record


def _create_ir_object(ir_data):
    """
    Create the inspection record object to be persisted.

    :param ir_request_data: The input payload for the endpoint.
    :param ir_data: The inspection record builder output.
    """
    return {
        "inspection_id": ir_data.get("inspection_id"),
        "ir_status_id": ir_data.get("ir_status_id").value,
        "inspection_scope": render_template_with_data(
            "INSPECTION_SCOPE", INSPECTION_SCOPE, ir_data.get("inspection_scope")
        ),
        "finding_statement": ir_data.get("finding_statement"),
        "enforcement_summary": ir_data.get("enforcement_summary"),
        "ir_progress": ir_data.get("ir_progress"),
    }


def _access_check_update(inspection: dict):
    """Access check for update."""
    auth_user_guid = g.token_info["preferred_username"]
    if (
        not auth.has_permission([PermissionEnum.SUPERUSER])
        and not inspection.primary_officer.auth_user_guid == auth_user_guid
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )
