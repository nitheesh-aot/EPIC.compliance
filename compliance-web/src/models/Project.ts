
export interface Project {
  id: number;
  name: string;
  description?: string;
  ea_certificate?: string;
  proponent_name?: string;
  is_active?: boolean;
  proponent?: Proponent;
}

interface Proponent {
  id: number;
  name: string;
  relationship_holder_id: string;
  is_active: boolean;
}
