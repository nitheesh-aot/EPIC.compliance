from http import HTTPStatus
from urllib.parse import urljoin

API_BASE_URL = '/api/'

def test_get_agencies(client, auth_header):
    """Test get code by type."""
    url = urljoin(API_BASE_URL, 'agencies')
    print(auth_header)
    print(url)
    result = client.get(url, headers=auth_header)
    print(result.json)
    assert result.status_code == HTTPStatus.OK