import { AppConfig } from "@/utils/config";


export const formatAuthorization = (eaCertifcate: string | undefined): string => {
  if (!eaCertifcate) return "n/a";
  return eaCertifcate[0].toLowerCase() === "x"
    ? "Exemption Order"
    : `EAC# ${eaCertifcate}`;
};

export const formatS3Url = (relativeUrl: string): string => {
  return `${AppConfig.awsS3.url}/${AppConfig.awsS3.bucketName}/${relativeUrl}`;
};
