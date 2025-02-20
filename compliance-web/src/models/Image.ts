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

