"""Class to manage epictrack services."""

import requests
from flask import current_app, g

from compliance_api.exceptions import BusinessError
from compliance_api.utils.enum import HttpMethod

from .constant import API_REQUEST_TIMEOUT


class TrackService:
    """EPIC.Track service class."""

    @staticmethod
    def get_project_by_id(project_id: int):
        """Return project details from track."""
        project_response = _request_track_service(f"projects/{project_id}")
        if project_response.status_code != 200:
            raise BusinessError(
                f"Error finding project with ID {project_id} from EPIC.track server"
            )
        return project_response.json()

    @staticmethod
    def get_first_nation_by_id(first_nation_id: int):
        """Return firstnation by id."""
        first_nation_response = _request_track_service(f"indigenous-nations/{first_nation_id}")
        if first_nation_response.status_code != 200:
            raise BusinessError(
                f"Error finding the first nation with ID {first_nation_id} from EPIC.track server"
            )
        return first_nation_response.json()


def _request_track_service(
    relative_url, http_method: HttpMethod = HttpMethod.GET, data=None
):
    """REST Api call to track service."""
    token = getattr(g, "access_token", None)
    if not token:
        raise BusinessError("No access token found", 401)
    auth_base_url = current_app.config["EPIC_TRACK_URL"]
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    url = f"{auth_base_url}/api/v1/{relative_url}"

    if http_method == HttpMethod.GET:
        response = requests.get(url, headers=headers, timeout=API_REQUEST_TIMEOUT)
    else:
        raise ValueError("Invalid HTTP method")
    response.raise_for_status()
    return response
