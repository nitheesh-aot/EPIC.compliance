
export interface Appendix {
  id?: number;
  inspection_id: number;
  appendix_no: string;
  document_title: string;
}


export interface AppendixFormData {
  appendixNumber: string;
  documentTitle: string;
}

export interface AppendixListItem {
  id: number;
  name: string;
}
