import { StaffUser } from "./Staff";

export interface Image {
  id?: number;
  file?: File;
  caption?: string;
  takenBy?: StaffUser;
  sortOrder?: number;
  imageUrl?: string;
  imageFileName?: string;
  imageFileDate?: string;
}

export interface ImageFormData {
  file?: File;
  caption?: string;
  takenBy?: StaffUser;
}

export interface ImageUploadAPIData {
  inspectionId: number;
  fileName: string;
  file: File;
}
export interface PresignedUrlRequestPayload {
  relative_url: string;
  action?: string;
} 
