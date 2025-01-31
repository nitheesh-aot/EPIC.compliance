import { AuthUser } from "./AuthUser";
import { Permission } from "./Permission";
import { Position } from "./Position";

export interface StaffUser {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  auth_user_guid?: string;
  position_id?: number;
  deputy_director_id?: number;
  supervisor_id?: number;
  permission?: Permission;
  position?: Position;
  deputy_director?: StaffUser;
  supervisor?: StaffUser;
  is_active: boolean;
}

export type StaffFormData = {
  name?: AuthUser;
  position?: Position;
  deputyDirector?: StaffUser;
  supervisor?: StaffUser;
  permission?: Permission;
  isActive: boolean;
}

export interface StaffAPIData {
  auth_user_guid: string;
  position_id: string;
  permission: string;
  supervisor_id?: number;
  deputy_director_id?: number;
  is_active: boolean;
}
