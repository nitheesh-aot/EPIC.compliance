export interface FirstNation {
  bcigid: string;
  id: number;
  is_active: boolean;
  name: string;
  notes: string;
  pip_link: string;
  pip_org_type_id: number;
  pip_org_type: OrgType;
  relationship_holder_id: number;
  relationship_holder: RelationshipHolder;
}

interface RelationshipHolder {
  email: string;
  first_name: string;
  full_name: string;
  id: number;
  idir_user_id: string;
  is_active: boolean;
  last_active_at: string;
  last_name: string;
  phone: string;
  position_id: number;
}

interface OrgType {
  id: number;
  is_active: boolean;
  name: string;
}
