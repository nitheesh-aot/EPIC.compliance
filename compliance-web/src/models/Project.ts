export interface Project {
  id: number;
  name: string;
  description?: string;
  ea_certificate?: string;
  proponent_name?: string;
  is_active?: boolean;
  proponent?: Proponent;
  type_id?: number;
  type?: ProjectType;
  sub_type_id?: number;
  sub_type?: ProjectType;
  abbreviation?: string
}

interface Proponent {
  id: number;
  name: string;
  relationship_holder_id: string;
  is_active: boolean;
}

interface ProjectType {
  id: number;
  is_active: boolean;
  name: string;
  short_name: string;
  sort_order: number;
}
