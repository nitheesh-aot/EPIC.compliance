"""Service to manage project status."""

from .epic_track_service.track_service import TrackService


class ProjectStatusService:
    """Project Status service class."""

    @classmethod
    def get_all_project_status_options(cls):
        """Get all project status options."""
        return TrackService.get_project_statuses()
