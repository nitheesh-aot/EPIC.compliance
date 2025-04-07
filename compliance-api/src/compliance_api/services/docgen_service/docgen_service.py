"""Service for generating documents."""
import requests
from flask import current_app, g, json
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_fixed

from compliance_api.exceptions import BusinessError
from compliance_api.utils.enum import HttpMethod
from compliance_api.utils.constant import AUTH_APP


class DocGenService:
    """Service for generating documents."""

    @staticmethod
    def render_template(template_key: str, context: dict, output_type: str = "html") -> str:
        """Render a template with the given context."""
        response = _request_docgen_service(
            "templates/render", HttpMethod.POST, {"template_key": template_key,
                                                  "app": AUTH_APP, "data": context, "output_type": output_type}
        )
        return response.json()


@retry(
    retry=retry_if_exception_type(requests.exceptions.RequestException),
    stop=stop_after_attempt(3),  # Retry up to 3 times
    wait=wait_fixed(2),  # Wait 2 seconds between retries
)
def _request_docgen_service(
    relative_url, http_method: HttpMethod = HttpMethod.GET, data=None
):
    """REST Api call to docgen service."""
    token = getattr(g, "access_token", None)
    if not token:
        raise BusinessError("No access token found", 401)
    docgen_service_url = current_app.config["DOCGEN_SERVICE_URL"]
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    url = f"{docgen_service_url}/api/{relative_url}"

    if http_method == HttpMethod.GET:
        response = requests.get(url, headers=headers, timeout=60)
    elif http_method == HttpMethod.POST:
        response = requests.post(
            url=url, headers=headers, data=json.dumps(data), timeout=60
        )
    else:
        raise ValueError("Invalid HTTP method")
    response.raise_for_status()
    return response
