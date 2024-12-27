"""test suit for compliance findings."""
from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = "/api/"


def test_get_compliance_findings(client, auth_header):
    """Get compliance findings."""
    url = urljoin(API_BASE_URL, "compliance-findings")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 3
    assert result.status_code == HTTPStatus.OK
