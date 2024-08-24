import { Position } from "./Position";
import { Permission } from "./Permission";
import { AuthUser } from "./AuthUser";

export interface StaffUser {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  auth_user_guid?: string;
  position_id?: number;
  deputy_director_id?: number;
  supervisor_id?: number;
  permission?: string;
  position?: Position;
  deputy_director?: StaffUser;
  supervisor?: StaffUser;
}

export type StaffFormData = {
  name?: AuthUser;
  position?: Position;
  deputyDirector?: StaffUser;
  supervisor?: StaffUser;
  permission?: Permission;
}

export interface StaffAPIData {
  auth_user_guid: string;
  position_id: string;
  permission: string;
  supervisor_id?: number;
  deputy_director_id?: number;
}
