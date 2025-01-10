"""Model for InspectionRequirementEnforcementMapping."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned, db


class InspectionReqEnforcementMap(BaseModelVersioned):
    """InspectionReqEnforcementMap."""

    __tablename__ = "inspection_req_enforcement_mappings"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    requirement_id = Column(
        Integer,
        ForeignKey(
            "inspection_requirements.id", name="inspection_req_enf_map_req_id_fkey"
        ),
        nullable=False,
        comment="The requirement id",
    )
    enforcement_action_id = Column(
        Integer,
        ForeignKey(
            "enforcement_action_options.id",
            name="insepction_req_enf_map_fkey",
        ),
        nullable=True,
        comment="The enforcement action taken on the requirement",
    )
    enforcement_action = relationship(
        "EnforcementActionOption", foreign_keys=[enforcement_action_id], lazy="joined"
    )
    requirement = relationship(
        "InspectionRequirement", foreign_keys=[requirement_id], lazy="joined"
    )

    @classmethod
    def get_all_by_requirement_id(cls, requirement_id: int):
        """Retrieve all enforcement_ids by requirement id."""
        return cls.query.filter_by(
            requirement_id=requirement_id, is_deleted=False, is_active=True
        ).all()

    @classmethod
    def bulk_delete(cls, requirement_id: int, enforcement_ids: list[int]):
        """Delete enforcement ids per inspection."""
        mappings = cls.query.filter(
            cls.requirement_id == requirement_id,
            cls.enforcement_action_id.in_(enforcement_ids),
            cls.is_active.is_(True),
            cls.is_deleted.is_(False),
        )
        for mapp in mappings:
            mapp.update({"is_active": False, "is_deleted": True}, commit=False)

    @classmethod
    def bulk_insert(cls, requirement_id: int, enforcement_ids: list[int], session=None):
        """Insert enforcement per requirement."""
        requirement_enforcement_map = [
            InspectionReqEnforcementMap(
                **{"requirement_id": requirement_id, "enforcement_action_id": enforcement_id}
            )
            for enforcement_id in enforcement_ids
        ]
        if session:
            session.add_all(requirement_enforcement_map)
            session.flush()
        else:
            db.session.add_all(requirement_enforcement_map)
            db.session.commit()
