import { Dayjs } from "dayjs";

export interface ContinuationReport {
  id: number;
  case_file_id: number,
  text: string,
  rich_text: string,
  context_id: number,
  system_generated: boolean,
  is_active: boolean
}

export interface ContinuationReportFormData {
  dateOfEntry?: Dayjs;
  entry?: {
    html: string;
    text: string;
  }
}
