import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AdministrativePenalty,
  AdministrativePenaltyAPIData,
} from "@/models/AdministrativePenalty";

const fetchAdministrativePenalties = (
  inspectionId: number
): Promise<AdministrativePenalty[]> => {
  return request({
    url: `/administrative-penalties`,
    params: { inspection_id: inspectionId },
  });
};

const fetchAdministrativePenaltyByNumber = (
  administrativePenaltyNumber: string
): Promise<AdministrativePenalty[]> => {
  return request({
    url: `/administrative-penalties/administrative-penalty-numbers/${administrativePenaltyNumber}`,
  });
};

const createAdministrativePenalty = ({
  administrativePenalty,
}: {
  administrativePenalty: AdministrativePenaltyAPIData;
}) => {
  return request({
    url: `/administrative-penalties`,
    method: "post",
    data: administrativePenalty,
  });
};

const updateAdministrativePenalty = ({
  administrativePenaltyId,
  administrativePenalty,
}: {
  administrativePenaltyId: number;
  administrativePenalty: AdministrativePenaltyAPIData;
}) => {
  return request({
    url: `/administrative-penalties/${administrativePenaltyId}`,
    method: "patch",
    data: administrativePenalty,
  });
};

const deleteAdministrativePenalty = ({
  administrativePenaltyId,
}: {
  administrativePenaltyId: number;
}) => {
  return request({
    url: `/administrative-penalties/${administrativePenaltyId}`,
    method: "delete",
  });
};

export const useAdministrativePenaltiesData = (
  inspectionId: number,
  { isStaleInfinate = true }: { isStaleInfinate?: boolean } = {}
) => {
  return useQuery({
    queryKey: ["inspection-administrative-penalties", inspectionId],
    queryFn: () => fetchAdministrativePenalties(inspectionId),
    enabled: !!inspectionId,
    staleTime: isStaleInfinate ? Infinity : 0,
  });
};

export const useFetchAdministrativePenaltyByNumber = (
  onSuccess: OnSuccessType
) => {
  return useMutation({
    mutationFn: fetchAdministrativePenaltyByNumber,
    onSuccess,
  });
};

export const useCreateAdministrativePenalty = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createAdministrativePenalty, onSuccess });
};

export const useUpdateAdministrativePenalty = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateAdministrativePenalty, onSuccess });
};

export const useDeleteAdministrativePenalty = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: deleteAdministrativePenalty,
    onSuccess,
  });
};
