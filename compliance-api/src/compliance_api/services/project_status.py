"""Service to manage project status."""

from compliance_api.models.project_status import ProjectStatusOption as ProjectStatusOptionModel


class ProjectStatusService:
    """Project Status service class."""

    @classmethod
    def get_all_project_status_options(cls):
        """Get all project status options."""
        return ProjectStatusOptionModel.get_all(sort_by="sort_order")
