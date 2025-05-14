
import { StaffUser } from "./Staff";

export interface InspectionOrder {
  issuing_officer?: StaffUser;
  section?: {
    id: number;
    name: string;
  };
  id?: number;
  where_as?: string;
  now_therefore?: string;
  order_number?: string;
  section_id?: number;
  date_issued?: string;
  intended_issuance_date?: string;
  inspection_id?: number;
  issuing_officer_id?: number;
  is_active?: boolean;
}

export interface InspectionOrderAPIData {
  section_id?: number;
  issuing_officer_id?: number;
  intended_issuance_date?: string;
  where_as?: string;
  now_therefore?: string;
  inspection_requirement_ids: number[];
  order_number?: string;
}
