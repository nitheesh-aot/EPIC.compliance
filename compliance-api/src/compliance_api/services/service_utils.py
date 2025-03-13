"""Some common methods which can be used across different services."""

from flask import g

from compliance_api.auth import auth
from compliance_api.exceptions import PermissionDeniedError, ResourceNotFoundError
from compliance_api.models import Inspection as InspectionModel
from compliance_api.models import InspectionRecord as InspectionRecordModel
from compliance_api.utils.enum import PermissionEnum


class ServiceUtils:
    """ServiceUtils class."""

    @staticmethod
    def access_check_update_for_inspection(inspection: dict):
        """Access check for update an inspection."""
        auth_user_guid = g.token_info["preferred_username"]
        if (
            not auth.has_permission([PermissionEnum.SUPERUSER])
            and not inspection.primary_officer.auth_user_guid == auth_user_guid
        ):
            raise PermissionDeniedError(
                "You don't have the correct permission to perform this operation."
            )

    @staticmethod
    def inspection_exist_check(inspection_id: int):
        """Check if the inspection exist or not."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError("Inspection not found")
        return inspection

    @staticmethod
    def inspection_record_exist_check(inspection_record_id: int):
        """Check if the inspection record exist or not."""
        inspection_record = InspectionRecordModel.find_by_id(inspection_record_id)
        if not inspection_record:
            raise ResourceNotFoundError("Inspection record not found")
        return inspection_record
