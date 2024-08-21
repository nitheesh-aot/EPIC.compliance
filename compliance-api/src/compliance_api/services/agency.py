"""Service for user management."""
from compliance_api.models import db
from compliance_api.models.agency import Agency as AgencyModel


class AgencyService:
    """Agency management service."""

    @classmethod
    def get_agency_by_id(cls, agency_id):
        """Get user by id."""
        agency = AgencyModel.find_by_id(agency_id)
        return agency

    @classmethod
    def get_all_agencies(cls):
        """Get all users."""
        users = AgencyModel.get_all()
        return users

    @classmethod
    def create_agency(cls, agency_data: dict, commit=True):
        """Create agency."""
        agency = AgencyModel(**agency_data)
        agency.flush()
        if commit:
            db.session.commit()
        return agency

    @classmethod
    def update_agency(cls, agency_id, agency_data, commit=True):
        """Update agency."""
        agency = AgencyModel.find_by_id(agency_id)
        if not agency or agency.is_deleted:
            return None
        agency.update(agency_data, commit=False)
        if commit:
            db.session.commit()
        return agency

    @classmethod
    def delete_agency(cls, agency_id, commit=True):
        """Delete the agency entity permenantly from database"""
        agency = AgencyModel.find_by_id(agency_id)
        if not agency or agency.is_deleted:
            return None
        db.session.delete(agency)
        db.session.flush()
        if commit:
            db.session.commit()
        return agency
