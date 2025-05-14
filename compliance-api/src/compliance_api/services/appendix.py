"""Service for appendix management."""

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import db
from compliance_api.models.appendix import Appendix as AppendixModel
from compliance_api.services.service_utils import ServiceUtils


class AppendixService:
    """Appendix management service."""

    @classmethod
    def get_by_id(cls, appendix_id):
        """Get appendix by id."""
        appendix = AppendixModel.find_by_id(appendix_id)
        return appendix

    @classmethod
    def get_by_inspection_id(cls, inspection_id):
        """Get appendix by id."""
        appendices = AppendixModel.get_by_inspection_id(inspection_id)
        return appendices

    @classmethod
    def get_all(cls):
        """Get all appendices."""
        appendices = AppendixModel.get_all(default_filters=False)
        return appendices

    @classmethod
    def create(cls, appendix_data: dict, commit=True):
        """Create appendix."""
        inspection_id = appendix_data.get("inspection_id")
        _check_existence_by_no(appendix_data.get("appendix_no"), inspection_id, None)
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        appendix = AppendixModel(**appendix_data)
        appendix.flush()
        if commit:
            db.session.commit()
        return appendix

    @classmethod
    def update(cls, appendix_id, appendix_data, commit=True):
        """Update appendix."""
        inspection_id = appendix_data.get("inspection_id")
        _check_existence_by_no(
            appendix_data.get("appendix_no"),
            inspection_id,
            appendix_id,
        )
        inspection = ServiceUtils.inspection_exist_check(
            appendix_data.get("inspection_id")
        )
        ServiceUtils.access_check_update_for_inspection(inspection)
        appendix = AppendixModel.find_by_id(appendix_id)
        if not appendix:
            return None
        appendix.update(appendix_data, commit=False)
        db.session.flush()
        if commit:
            db.session.commit()
        return appendix

    @classmethod
    def delete(cls, agency_id, commit=True):
        """Delete the appendix entity permenantly from database."""
        appendix = AppendixModel.find_by_id(agency_id)
        inspection = ServiceUtils.inspection_exist_check(appendix.inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        if not appendix:
            return None
        appendix.is_deleted = True
        appendix.is_active = False
        db.session.flush()
        if commit:
            db.session.commit()
        return appendix


def _check_existence_by_no(
    appendix_no: str, inspection_id: int, appendix_id: int = None
):
    """Check if the appendix exists."""
    existing_appendix = AppendixModel.get_by_no_nd_inspection(
        appendix_no, inspection_id
    )
    if existing_appendix and (not appendix_id or existing_appendix.id != appendix_id):
        raise ResourceExistsError(f"Appendix with the number {appendix_no} exists")
