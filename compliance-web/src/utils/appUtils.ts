
export const formatAuthorization = (eaCertifcate: string | undefined): string => {
  if (!eaCertifcate) return "n/a";
  return eaCertifcate[0].toLowerCase() === "x"
    ? "Exemption Order"
    : `EAC# ${eaCertifcate}`;
};

