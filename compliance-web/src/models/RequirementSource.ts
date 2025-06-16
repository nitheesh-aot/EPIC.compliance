import { Topic } from "./Topic";

export interface RequirementSource {
  id: string;
  name: string;
}

export interface RequirementDetails {
  id: number;
  description?: string;
  topic_id: number;
  topic: Topic;
  additional_details?: {
    condition_number?: string;
    amendment_condition_number?: string;
    amendment_number?: string;
    req_id?: number;
    order_number?: string;
  }
}
