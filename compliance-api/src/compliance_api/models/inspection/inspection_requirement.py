"""InspectionRequirement Model."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned, db


class InspectionRequirement(BaseModelVersioned):
    """InspectionRequirementModel."""

    __tablename__ = "inspection_requirements"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id", name="inspection_requirements_inspection_id_fkey"),
        nullable=False,
        index=True,
        comment="The unique identifier of the inspection",
    )
    summary = Column(String, nullable=False, comment="The summary of the requirement")
    topic_id = Column(
        Integer,
        ForeignKey("topics.id", name="inspection_requirements_topic_id_fkey"),
        nullable=False,
        comment="The topic of the requirement",
    )
    compliance_finding_id = Column(
        Integer,
        ForeignKey(
            "compliance_finding_options.id",
            name="inspection_req_compliance_finding_fkey",
        ),
        nullable=True,
        comment="Compliance finding of the requirement",
    )
    findings = Column(String, nullable=True, comment="The findings of the requirement")
    sort_order = Column(Integer, nullable=False, comment="The order of requirements")
    is_deleted = Column(Boolean, default=False, server_default="f", nullable=False)

    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    topic = relationship("Topic", foreign_keys=[topic_id], lazy="joined")
    compliance_finding = relationship(
        "ComplianceFindingOption", foreign_keys=[compliance_finding_id], lazy="joined"
    )
    requirement_source_details = relationship(
        "InspectionReqSourceDetail",
        back_populates="inspection_requirement",
        lazy="select",
        primaryjoin="and_(InspectionReqSourceDetail.requirement_id == InspectionRequirement.id, "
        "InspectionReqSourceDetail.is_active == True, "
        "InspectionReqSourceDetail.is_deleted == False)",
    )
    enforcement_actions = relationship(
        "InspectionReqEnforcementMap", back_populates="requirement", lazy="select"
    )

    @classmethod
    def create_requirement(cls, requirement_obj, session=None):
        """Persist inspection requirement in database."""
        requirement = InspectionRequirement(**requirement_obj)
        if session:
            session.add(requirement)
            session.flush()
        else:
            requirement.save()
        return requirement

    @classmethod
    def delete_requirement(cls, requirement_id, session=None):
        """Delete the requirement."""
        requirement = cls.find_by_id(requirement_id)
        if not requirement:
            return None
        requirement.update(DELETE_DIC_PARAMS, commit=False)
        if session:
            session.flush()
        else:
            db.session.commit()
        return requirement

    @classmethod
    def get_by_inspection_id(cls, inspection_id):
        """Get requirements by inspection id."""
        return (
            db.session.query(InspectionRequirement)
            .filter_by(inspection_id=inspection_id, is_deleted=False, is_active=True)
            .order_by(cls.sort_order)
            .all()
        )

    @classmethod
    def update_requirement(cls, requirement_id, requirement_data, session=None):
        """Update inspection requirement."""
        query = cls.query.filter_by(id=requirement_id)
        requirement: InspectionRequirement = query.first()
        if not requirement or requirement.is_deleted:
            return None
        requirement.update(requirement_data, commit=False)
        if session:
            session.flush()
        else:
            db.session.commit()
        return requirement
