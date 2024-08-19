import { Position } from "./Position";
import { Permission } from "./Permission";
import { AuthUser } from "./AuthUser";

export interface Staff {
  id: number;
  name?: number;
  position?: string;
  deputyDirector?: number;
  supervisor?: number;
  permission?: string;
}

export interface StaffUser {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  auth_user_guid?: string;
  position_id?: number;
  deputy_director_id?: number;
  supervisor_id?: number;
  position?: Position;
  deputy_director?: StaffUser;
  supervisor?: StaffUser;
}

export interface StaffFormData {
  id: number;
  name: AuthUser | null;
  position: Position | null;
  deputyDirector: AuthUser | null;
  supervisor: AuthUser | null;
  permission: Permission | null;
}

export interface StaffAPIData {
  auth_user_guid: string;
  position_id: string;
  permission: string;
  supervisor_id?: string;
  deputy_director_id?: string;
}
