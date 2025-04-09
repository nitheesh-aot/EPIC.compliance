import { InspectionRecord } from "@/models/InspectionRecord";
import { IRApproval } from "@/models/IRApproval";
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

const createIRApproval = ({
  inspectionId,
  inspectionRecordId,
  approvalPayload,
}: {
  inspectionId: number;
  inspectionRecordId: number;
  approvalPayload: {
    approved_by_id: number;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/inspection-records/${inspectionRecordId}/approvals`,
    method: "post",
    data: approvalPayload,
  });
};

const fetchIRApprovals = ({
  inspectionId,
  inspectionRecordId,
}: {
  inspectionId: number;
  inspectionRecordId: number;
}): Promise<IRApproval[]> => {
  return request({
    url: `/inspections/${inspectionId}/inspection-records/${inspectionRecordId}/approvals`,
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

export const useCreateIRApproval = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: createIRApproval,
    onSuccess,
  });
};

export const useFetchIRApprovals = (
  inspectionId: number,
  inspectionRecordId: number
) => {
  return useQuery({
    queryKey: ["ir-approvals", inspectionId, inspectionRecordId],
    queryFn: () => fetchIRApprovals({ inspectionId, inspectionRecordId }),
    enabled: !!inspectionId && !!inspectionRecordId,
    staleTime: Infinity,
  });
};
