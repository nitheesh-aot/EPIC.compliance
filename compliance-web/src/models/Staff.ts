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

export interface StaffFormData {
  id: number;
  name: MockUser | null;
  position: Position | null;
  deputyDirector: MockUser | null;
  supervisor: MockUser | null;
  permission: Permission | null;
}
