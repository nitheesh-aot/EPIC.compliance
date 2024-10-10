# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Bring in the common JWT Manager."""
from functools import wraps
from http import HTTPStatus

from flask import g, request
from flask_jwt_oidc import JwtManager

from compliance_api.exceptions import PermissionDeniedError
from compliance_api.services import CaseFileService, ComplaintService, InspectionService
from compliance_api.utils.enum import ContextEnum


jwt = (
    JwtManager()
)  # pylint: disable=invalid-name; lower case name as used by convention in most Flask apps


class Auth:  # pylint: disable=too-few-public-methods
    """Extending JwtManager to include additional functionalities."""

    @classmethod
    def require(cls, f):
        """Validate the Bearer Token."""

        @jwt.requires_auth
        @wraps(f)
        def decorated(*args, **kwargs):
            g.authorization_header = request.headers.get("Authorization", None)
            g.token_info = g.jwt_oidc_token_info

            return f(*args, **kwargs)

        return decorated

    @classmethod
    def is_allowed(cls, context: ContextEnum, roles):
        """Check to see if user is allowed to access the function."""

        def decorated(f):
            @Auth.require
            @wraps(f)
            def wrapper(*args, **kwargs):
                auth_user_guid = g.token_info["preferred_username"]

                # Create a context-to-service mapping
                context_service_map = {
                    ContextEnum.INSPECTION: ("inspection_id", InspectionService),
                    ContextEnum.COMPLAINT: ("complaint_id", ComplaintService),
                    ContextEnum.CASE_FILE: ("case_file_id", CaseFileService),
                }

                # Retrieve the corresponding ID and service for the given context
                id_field, service = context_service_map.get(context, (None, None))

                if id_field and service:
                    is_allowed = service.is_assigned_user(
                        kwargs[id_field], auth_user_guid
                    )
                    if not is_allowed and not jwt.contains_role(roles):
                        raise PermissionDeniedError(
                            "Access Denied", HTTPStatus.FORBIDDEN
                        )
                else:
                    raise PermissionDeniedError("Invalid Context", HTTPStatus.FORBIDDEN)

                return f(*args, **kwargs)

            return wrapper

        return decorated

    @classmethod
    def has_one_of_roles(cls, roles):
        """Check that at least one of the realm roles are in the token.

        Args:
            roles [str,]: Comma separated list of valid roles
        """

        def decorated(f):
            @Auth.require
            @wraps(f)
            def wrapper(*args, **kwargs):
                if jwt.contains_role(roles):
                    return f(*args, **kwargs)

                raise PermissionDeniedError("Access Denied", HTTPStatus.FORBIDDEN)

            return wrapper

        return decorated

    @classmethod
    def has_role(cls, role):
        """Validate the role."""
        return jwt.validate_roles(role)


auth = Auth()
