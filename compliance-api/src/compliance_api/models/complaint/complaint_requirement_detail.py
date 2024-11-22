"""Complaint requirement detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned
from ..complaint.complaint import Complaint as ComplaintModel
from .complaint_req_eac_detail import ComplaintReqEACDetail as ComplaintReqEACDetailModel
from .complaint_req_order_detail import ComplaintReqOrderDetail as ComplaintReqOrderDetailModel
from .complaint_req_schedule_b_detail import ComplaintReqScheduleBDetail as ComplaintReqScheduleBDetailModel


class ComplaintRequirementDetail(BaseModelVersioned):
    """ComplaintRequirementDetail Model Class."""

    __tablename__ = "complaint_requirement_details"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the complaints",
    )
    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id", name="details_complaint_id_complaints_id"),
        nullable=False,
        comment="The associated complaint",
    )
    topic_id = Column(
        Integer,
        ForeignKey("topics.id", name="details_topic_id_topics_id"),
        nullable=False,
        comment="The topic of the requirement",
    )
    description = Column(
        String, nullable=True, comment="Any description of the requirement"
    )
    topic = relationship("Topic", foreign_keys=[topic_id], lazy="select")
    complaint = relationship(
        "Complaint",
        foreign_keys=[complaint_id],
        lazy="joined",
        back_populates="requirement_detail",
    )

    @classmethod
    def create_detail(cls, requirement_source_data, session=None):
        """Persist details in database."""
        requirement_source_detail = ComplaintRequirementDetail(
            **requirement_source_data
        )
        if session:
            session.add(requirement_source_detail)
            session.flush()
        else:
            requirement_source_detail.save()
        return requirement_source_detail

    @classmethod
    def update_detail(cls, complaint_id, requirement_source_data, session=None):
        """Update requirement source details."""
        query = cls.query.filter_by(complaint_id=complaint_id, is_deleted=False)
        requirement: ComplaintRequirementDetail = query.first()
        if not requirement:
            return None
        query.update(requirement_source_data)
        if session:
            session.flush()
        else:
            cls.session.commit()
        return requirement

    @classmethod
    def get_by_complaint(cls, complaint_id):
        """Get requirement details by complaint id."""
        return cls.query.filter_by(complaint_id=complaint_id, is_deleted=False).first()

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete requirement details by case file."""
        detail_query = cls.query.join(ComplaintModel).filter(
            ComplaintModel.case_file_id == case_file_id,
            ComplaintRequirementDetail.is_deleted is False,
        )
        requirements = detail_query.all()
        requirement_ids = [requirement.id for requirement in requirements]
        if requirement_ids:
            cls.query.filter(ComplaintRequirementDetail.id.in_(requirement_ids)).update(
                {cls.is_deleted: True, cls.is_active: False}
            )

        eacs = (
            detail_query.join(
                ComplaintReqEACDetailModel,
                ComplaintRequirementDetail.id == ComplaintReqEACDetailModel.req_id,
            )
            .filter(ComplaintReqEACDetailModel.is_deleted is False)
            .all()
        )
        eac_ids = [eac.id for eac in eacs]
        if eac_ids:
            cls.query.filter(ComplaintReqEACDetailModel.id.in_(eac_ids)).update(
                {
                    ComplaintReqEACDetailModel.is_deleted: True,
                    ComplaintReqEACDetailModel.is_active: False,
                }
            )

        orders = (
            detail_query.join(
                ComplaintReqOrderDetailModel,
                ComplaintRequirementDetail.id == ComplaintReqOrderDetailModel.req_id,
            )
            .filter(ComplaintReqOrderDetailModel.is_deleted is False)
            .all()
        )
        order_ids = [order.id for order in orders]
        if order_ids:
            cls.query.filter(ComplaintReqOrderDetailModel.id.in_(order_ids)).update(
                {
                    ComplaintReqOrderDetailModel.is_deleted: True,
                    ComplaintReqOrderDetailModel.is_active: False,
                }
            )

        schedule_b_details = (
            detail_query.join(
                ComplaintReqScheduleBDetailModel,
                ComplaintRequirementDetail.id
                == ComplaintReqScheduleBDetailModel.req_id,
            )
            .filter(ComplaintReqScheduleBDetailModel.is_deleted is False)
            .all()
        )
        schedule_b_ids = [schedule.id for schedule in schedule_b_details]
        if schedule_b_ids:
            cls.query.filter(
                ComplaintReqScheduleBDetailModel.id.in_(schedule_b_ids)
            ).update(
                {
                    ComplaintReqScheduleBDetailModel.is_deleted: True,
                    ComplaintReqScheduleBDetailModel.is_active: False,
                }
            )
        if session:
            session.flush()
        else:
            cls.session.commit()
