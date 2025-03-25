import { InspectionRecord } from "@/models/InspectionRecord";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchInspectionReports = (
  inspectionId: number
): Promise<InspectionRecord> => {
  return request({ url: `/inspections/${inspectionId}/inspection-records` });
};

const createInspectionRecord = ({
  inspectionId,
  inspectionRecordType,
}: {
  inspectionId: number;
  inspectionRecordType: {
    ir_status: number;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/inspection-records`,
    method: "post",
    data: inspectionRecordType,
  });
};

const updateInspectionRecord = ({
  inspectionId,
  inspectionRecordId,
  updateRecord,
}: {
  inspectionId: number;
  inspectionRecordId: number;
  updateRecord: {
    field_name: string;
    value: string;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/inspection-records/${inspectionRecordId}`,
    method: "patch",
    data: updateRecord,
  });
};

const resetInspectionRecord = ({
  inspectionId,
  inspectionRecordId,
  resetPayload,
}: {
  inspectionId: number;
  inspectionRecordId: number;
  resetPayload: {
    field_name: string;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/inspection-records/${inspectionRecordId}/reset`,
    method: "patch",
    data: resetPayload,
  });
};

export const useInspectionReportsData = (inspectionId: number) => {
  return useQuery({
    queryKey: ["inspection-reports", inspectionId],
    queryFn: () => fetchInspectionReports(inspectionId),
    enabled: !!inspectionId,
    staleTime: Infinity,
  });
};

export const useCreateInspectionRecord = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: createInspectionRecord,
    onSuccess,
  });
};

export const useUpdateInspectionRecord = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: updateInspectionRecord,
    onSuccess,
  });
};

export const useResetInspectionRecord = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: resetInspectionRecord,
    onSuccess,
  });
};
