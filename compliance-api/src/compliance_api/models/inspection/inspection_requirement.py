"""InspectionRequirement Model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


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
        comment="The unique identifier of the inspection",
    )
    summary = Column(String, nullable=False, comment="The summary of the requirement")
    topic_id = Column(
        Integer,
        ForeignKey("topics.id", name="inspection_requirements_topic_id_fkey"),
        nullable=False,
        comment="The topic of the requirement",
    )
    enforcement_action_id = Column(
        Integer,
        ForeignKey(
            "enforcement_action_options.id",
            name="insepction_requirements_enforcement_action_fkey",
        ),
        nullable=True,
        comment="The enforcement action taken on the requirement",
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

    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    topic = relationship("Topic", foreign_keys=[topic_id], lazy="joined")
    enforcement_action = relationship(
        "EnforcementActionOption", foreign_keys=[enforcement_action_id], lazy="joined"
    )
    compliance_finding = relationship(
        "ComplianceFindingOption", foreign_keys=[compliance_finding_id], lazy="joined"
    )
    requirement_source_details = relationship(
        "InspectionReqSourceDetail",
        back_populates="inspection_requirement",
        lazy="joined",
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
