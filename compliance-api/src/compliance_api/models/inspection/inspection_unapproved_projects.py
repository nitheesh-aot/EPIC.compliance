"""Model to handle unapproved projects of inspection."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class InspectionUnapprovedProject(BaseModel):
    """Unapproved project model for inspection."""

    __tablename__ = "inspection_unapproved_projects"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    name = Column(String, nullable=False, comment="The title of the unapproved project")
    description = Column(
        String, nullable=True, comment="The description of the project"
    )
    authorization = Column(
        String, nullable=True, comment="The details of authorization for the project"
    )
    type = Column(String, nullable=True, comment="The type of project")
    sub_type = Column(String, nullable=True, comment="The sub type of the project")
    regulated_party = Column(
        String,
        nullable=True,
        comment="The details of regulated party associated with the project",
    )
    inspection_id = Column(
        Integer,
        ForeignKey(
            "inspections.id", name="inspection_unapproved_projects_inspection_id_fkey"
        ),
        nullable=False,
    )
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")

    @classmethod
    def create_project_info(cls, project_data, session=None):
        """Persist inspection in database."""
        unapproved_project = InspectionUnapprovedProject(**project_data)
        if session:
            session.add(unapproved_project)
            session.flush()
        else:
            unapproved_project.save()
        return unapproved_project
