"""Complaint requirement EAC detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


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

    @classmethod
    def create(cls, requirement_obj, session=None):
        """Create eac details."""
        requirement_more = ComplaintReqEACDetail(**requirement_obj)
        if session:
            session.add(requirement_more)
            session.flush()
        else:
            requirement_more.save()
        return requirement_more
