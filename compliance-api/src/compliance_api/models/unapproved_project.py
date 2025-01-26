"""Model to handle unapproved projects of inspection."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from .base_model import BaseModelVersioned, db


class UnapprovedProject(BaseModelVersioned):
    """Unapproved project model for case file."""

    __tablename__ = "unapproved_projects"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    name = Column(String, nullable=False, comment="The title of the unapproved project")
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
    case_file_id = Column(
        Integer,
        ForeignKey(
            "case_files.id", name="unapproved_projects_case_file_id_case_file_fk"
        ),
        nullable=False,
    )
    case_file = relationship("CaseFile", foreign_keys=[case_file_id], lazy="select")

    @classmethod
    def create_project_info(cls, project_data, session=None):
        """Persist inspection in database."""
        unapproved_project = UnapprovedProject(**project_data)
        if session:
            session.add(unapproved_project)
            session.flush()
        else:
            unapproved_project.save()
        return unapproved_project

    @classmethod
    def get_by_case_file_id(cls, case_file_id):
        """Find unapproved project info based on case_file_id."""
        return cls.query.filter_by(case_file_id=case_file_id, is_deleted=False).first()

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete unapproved project details by case_file_id."""
        projects = cls.query.filter(
            UnapprovedProject.case_file_id == case_file_id,
            UnapprovedProject.is_deleted is False,
        ).all()
        for project in projects:
            project.update(DELETE_DIC_PARAMS, commit=False)
        if session:
            session.flush()
        else:
            db.session.commit()
