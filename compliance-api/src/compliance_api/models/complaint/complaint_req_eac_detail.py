"""Complaint requirement EAC detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned
from ..utils import with_session


class ComplaintReqEACDetail(BaseModelVersioned):
    """ComplaintReqEACDetail Model Class."""

    __tablename__ = "complaint_req_eac_details"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the complaints",
    )
    req_id = Column(
        Integer,
        ForeignKey(
            "complaint_requirement_details.id",
            name="details_req_id_complaint_req_detail_id",
        ),
        nullable=False,
        comment="The unique id of the requirement details",
    )
    amendment_number = Column(String, nullable=True, comment="The amendment number")
    amendment_condition_number = Column(
        String, nullable=True, comment="The amendment condition number"
    )
    requirement_detail = relationship(
        "ComplaintRequirementDetail", foreign_keys=[req_id], lazy="select"
    )

    def to_dict(self):
        """Convert model instance to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "req_id": self.req_id,
            "amendment_number": self.amendment_number,
            "amendment_condition_number": self.amendment_condition_number,
        }

    @classmethod
    @with_session
    def create(cls, requirement_obj, session=None):
        """Create eac details."""
        requirement_more = ComplaintReqEACDetail(**requirement_obj)
        session.add(requirement_more)
        session.flush()
        return requirement_more

    @classmethod
    @with_session
    def update_details(cls, req_id, requirement_obj, session=None):
        """Update eac details."""
        query = cls.query.filter_by(req_id=req_id, is_deleted=False)
        eac_requirement = query.first()
        eac_requirement.update(requirement_obj, commit=False)
        session.flush()
        return eac_requirement

    @classmethod
    @with_session
    def delete_details(cls, requirement_id, session=None):
        """Mark the eac details as deleted."""
        eac_requirement = cls.query.filter_by(
            req_id=requirement_id, is_deleted=False
        ).first()
        eac_requirement.update(DELETE_DIC_PARAMS, commit=False)
        session.flush()

    @classmethod
    def get_by_requirement(cls, req_id):
        """Get additional requirement source eac details."""
        return cls.query.filter_by(req_id=req_id, is_deleted=False).first()
