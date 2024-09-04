"""Service for agency management."""

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import db
from compliance_api.models.agency import Agency as AgencyModel


class AgencyService:
    """Agency management service."""

    @classmethod
    def get_agency_by_id(cls, agency_id):
        """Get agency by id."""
        agency = AgencyModel.find_by_id(agency_id)
        return agency

    @classmethod
    def get_all_agencies(cls):
        """Get all agencies."""
        users = AgencyModel.get_all(default_filters=False)
        return users

    @classmethod
    def create_agency(cls, agency_data: dict, commit=True):
        """Create agency."""
        _check_agency_existence(agency_data.get("name", None))
        agency = AgencyModel(**agency_data)
        agency.flush()
        if commit:
            db.session.commit()
        return agency

    @classmethod
    def update_agency(cls, agency_id, agency_data, commit=True):
        """Update agency."""
        _check_agency_existence(agency_data.get("name", None), agency_id)
        agency = AgencyModel.find_by_id(agency_id)
        if not agency:
            return None
        agency.update(agency_data, commit=False)
        if commit:
            db.session.commit()
        return agency

    @classmethod
    def delete_agency(cls, agency_id, commit=True):
        """Delete the agency entity permenantly from database."""
        agency = AgencyModel.find_by_id(agency_id)
        if not agency:
            return None
        agency.is_deleted = True
        db.session.flush()
        if commit:
            db.session.commit()
        return agency


def _check_agency_existence(agency_name: str, agency_id: int = None):
    """Check if the agency exists."""
    existing_agency = AgencyModel.get_agency_by_name(agency_name)
    if existing_agency and (not agency_id or existing_agency.id != agency_id):
        raise ResourceExistsError(f"Agency with the name {agency_name} exists")
