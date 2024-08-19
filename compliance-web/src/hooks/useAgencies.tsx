import { useMutation, useQuery } from "@tanstack/react-query";
import { OnErrorType, OnSuccessType, request } from "@/utils/axiosUtils";
import { Agency } from "@/models/Agency";

const fetchAgencies = (): Promise<Agency[]> => {
  return request({ url: "/agencies" });
};

const addAgency = (agency: Omit<Agency, "id">) => {
  return request({ url: "/agencies", method: "post", data: agency });
};

const updateAgency = ({
  id,
  agency,
}: {
  id: number;
  agency: Omit<Agency, "id">;
}) => {
  return request({ url: `/agencies/${id}`, method: "patch", data: agency });
};

const deleteAgency = (id: number) => {
  return request({ url: `/agencies/${id}`, method: "delete" });
};

export const useAgenciesData = () => {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: fetchAgencies,
  });
};

export const useAddAgency = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: addAgency,
    onSuccess,
    onError,
  });
};

export const useUpdateAgency = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: updateAgency,
    onSuccess,
    onError,
  });
};

export const useDeleteAgency = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: deleteAgency,
    onSuccess,
    onError,
  });
};
