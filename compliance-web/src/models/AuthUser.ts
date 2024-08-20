
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  username: string;
  groups?: Group[];
}

interface Group {
  id: string;
  name: string;
  path: string;
  level: number;
  display_name: string;
}
