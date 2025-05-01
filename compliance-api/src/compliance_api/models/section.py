"""Section model."""

from sqlalchemy import Boolean, Column, Index, Integer, String

from .base_model import BaseModelVersioned


class Section(BaseModelVersioned):
    """Section model."""

    __tablename__ = "sections"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the section",
    )
    name = Column(String, nullable=False, comment="The name of the section")
    act = Column(Integer, nullable=False, comment="The act associated with the section")
    # chapter = Column(Integer, nullable=False, comment="The chapter associated with the section")
    is_deleted = Column(Boolean, default=False, server_default="f", nullable=False)

    __table_args__ = (
        Index(
            "ix_sections_unique_name_act_active",
            "name",
            "act",
            unique=True,
            postgresql_where=(is_deleted is False),
        ),
    )

    @classmethod
    def get_by_name_act(cls, name: str, act: int):
        """Get section by name and act."""
        return cls.query.filter_by(name=name, act=act, is_deleted=False).first()

