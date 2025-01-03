"""test suit for document type."""
from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = "/api/"


def test_get_document_type(client, auth_header):
    """Get document type."""
    url = urljoin(API_BASE_URL, "document-types")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 2
    assert result.status_code == HTTPStatus.OK
