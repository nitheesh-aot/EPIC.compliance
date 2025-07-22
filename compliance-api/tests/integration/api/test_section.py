"""Test suite for sections."""

from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = "/api/"


def test_get_sections(app, client, auth_header_super_user):
    """Get sections."""
    url = urljoin(API_BASE_URL, "sections")
    result = client.get(url, headers=auth_header_super_user)
    assert len(result.json) > 0
    assert result.status_code == HTTPStatus.OK
