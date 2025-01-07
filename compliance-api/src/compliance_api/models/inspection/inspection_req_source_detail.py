"""InspectionRequirementSourceDetail Model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned, db


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
        "InspectionRequirement",
        back_populates="requirement_source_details",
        lazy="select",
        uselist=False,
    )
    requirement_source = relationship(
        "RequirementSource", foreign_keys=[requirement_source_id], lazy="joined"
    )
    documents = relationship(
        "InspectionReqDetailDocument",
        back_populates="requirement_source_detail",
        lazy="select",
    )

    @classmethod
    def create_source_detail(cls, source_detail_obj, session=None):
        """Persist source detail in database."""
        source_detail = InspectionReqSourceDetail(**source_detail_obj)
        if session:
            session.add(source_detail)
            session.flush()
        else:
            source_detail.save()
        return source_detail

    @classmethod
    def update_requirement_source_detail(
        cls, req_detail_id, source_detail_data, session=None
    ):
        """Update requirement detail."""
        query = cls.query.filter_by(id=req_detail_id)
        source_detail: InspectionReqSourceDetail = query.first()
        if not source_detail or source_detail.is_deleted:
            return None
        query.update(source_detail_data)
        if session:
            session.flush()
        else:
            db.session.commit()
        return source_detail

    @classmethod
    def get_all_by_requirement_id(cls, requirement_id):
        """Get all requirement detail entries by requirement_id."""
        return cls.query.filter_by(
            requirement_id=requirement_id, is_active=True, is_deleted=False
        ).all()

    @classmethod
    def delete_req_details_by_ids(cls, req_detail_ids, session=None):
        """Delete the requirement details by req_detail_ids."""
        cls.query.filter(InspectionReqSourceDetail.id.in_(req_detail_ids)).update(
            {cls.is_deleted: True, cls.is_active: False}
        )
        if session:
            session.flush()
        else:
            db.session.commit()
