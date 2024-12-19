"""InspectionRequirementSourceDetail Model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


class InspectionReqSourceDetail(BaseModelVersioned):
    """InspectionReqSourceDetail."""

    __tablename__ = "inspection_req_source_details"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    requirement_id = Column(
        Integer,
        ForeignKey(
            "inspection_requirements.id", name="inspection_req_detail_req_id_fkey"
        ),
        nullable=False,
        comment="The requirement id",
    )
    requirement_source_id = Column(
        Integer,
        ForeignKey(
            "requirement_sources.id", name="inspection_req_detail_source_id_fkey"
        ),
        nullable=False,
        comment="The source of the requirement",
    )
    section_number = Column(
        String,
        nullable=True,
        comment="The optional section number associated with requirement sources"
        "(Act (2018), Schedule A, Compliance Agreement, Act (2002))",
    )
    condition_number = Column(
        String,
        nullable=True,
        comment="The optional condition number associated with rquirement sources(Schedule B, EAC Certificate)",
    )
    amendment_number = Column(
        String,
        nullable=True,
        comment="The optional amendment number if the requirement source is EAC Amendment",
    )
    title = Column(
        String, nullable=True, comment="The title of the requirement source detail"
    )
    description = Column(
        String,
        nullable=True,
        comment="The description of the requirement source detail",
    )
    inspection_requirement = relationship(
        "InspectionRequirement", foreign_keys=[requirement_id], lazy="select"
    )
    requirement_source = relationship(
        "RequirementSource", foreign_keys=[requirement_source_id], lazy="joined"
    )
