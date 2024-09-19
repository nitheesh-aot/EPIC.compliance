"""ComplaintReqOrderDetail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class ComplaintReqOrderDetail(BaseModel):
    """ComplaintReqOrderDetail Model Class."""

    __tablename__ = "complaint_req_order_details"

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
    order_number = Column(String, nullable=True, comment="The order number")
    requirement_detail = relationship(
        "ComplaintRequirementDetail", foreign_keys=[req_id], lazy="select"
    )
