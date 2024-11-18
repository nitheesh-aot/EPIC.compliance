import { Agency } from "./Agency";
import { FirstNation } from "./FirstNation";
import { StaffUser } from "./Staff";

export interface Attendance {
  id: string;
  name: string;
}

export interface InspectionAttendance {
  id: number; 
  inspection_id: number;
  attendance_option_id: number;
  attendance_option: Attendance;
  data: Agency[] | FirstNation[] | StaffUser[] | string | null;
}
