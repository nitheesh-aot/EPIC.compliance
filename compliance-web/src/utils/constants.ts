// App Constants should go here

export const APP_SIDE_NAV_WIDTH = 260;
export const APP_SIDE_NAV_WIDTH_COLLAPSED = 68;

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

export const UNAPPROVED_PROJECT_ID = 99999;
export const UNAPPROVED_PROJECT_ABBREVIATION = "UNPRVD";

export const INITIATION = {
  INSPECTION_ID: "1",
  COMPLAINTS_ID: "2",
};

export const CORS_ERROR_MSG = "Network error or CORS issue";

export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const REGEX_PHONE_NUMBER = /^\(\d{3}\) \d{3}-\d{4}$/;

export enum RequirementSourceEnum {
  SCHEDULE_B = "1",
  EAC = "3",
  CPD = "4",
  ACT2018 = "5",
  COMPLAINCE_AGREEMENT = "6",
  ACT2022 = "7",
  NOT_EA_ACT = "8",
  OTHER = "9",
  EACA = "10",
}

export const CR_CONTEXT_TYPE = {
  INSPECTION: "Inspection",
  COMPLAINT: "Complaint",
  CASEFILE: "Casefile",
}

export const FILE_PROFILE_CONTEXT = CR_CONTEXT_TYPE;
