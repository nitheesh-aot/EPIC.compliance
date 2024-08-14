import { MockUser } from "@/hooks/useStaff";
import { Position } from "./Position";
import { Permission } from "./Permission";

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
  name: MockUser | null;
  position: Position | null;
  deputyDirector: MockUser | null;
  supervisor: MockUser | null;
  permission: Permission | null;
}
