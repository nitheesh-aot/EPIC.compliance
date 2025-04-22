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

export function mergeMapsWithArrayConcat<K, V>(...maps: Map<K, V[]>[]): Map<K, V[]> {
  const result = new Map<K, V[]>();

  for (const map of maps) {
    for (const [key, value] of map) {
      result.set(key, [...(result.get(key) || []), ...value]);
    }
  }

  return result;
}

export const downloadFile = (blob: Blob, filename: string) => {
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element and set properties for download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, click and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the blob URL
  URL.revokeObjectURL(url);
};
