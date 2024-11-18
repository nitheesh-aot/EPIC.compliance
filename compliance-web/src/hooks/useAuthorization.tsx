import { jwtDecode, JwtPayload } from "jwt-decode";
import { useAuth } from "react-oidc-context";

interface CustomJwtPayload extends JwtPayload {
  groups?: string[];
}

export const KC_USER_GROUPS = {
  SUPERUSER: "/COMPLIANCE/SUPERUSER",
  USER: "/COMPLIANCE/USER",
  ADMIN: "/COMPLIANCE/ADMIN",
  VIEWER: "/COMPLIANCE/VIEWER",
};

export const useAccessTokenGroups = () => {
  const auth = useAuth();
  if (auth.user?.access_token) {
    const decodedToken = jwtDecode<CustomJwtPayload>(auth.user?.access_token);
    return decodedToken.groups;
  }
  return [];
};

export const useIsRolesAllowed = (roles: string[]): boolean => {
  const groups = useAccessTokenGroups();
  return roles.some((role) => groups?.includes(role));
}
