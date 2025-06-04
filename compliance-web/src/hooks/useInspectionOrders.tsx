import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionOrder,
  InspectionOrderAPIData,
} from "@/models/InspectionOrder";
import { OrderApproval } from "@/models/OrderApproval";

const fetchInspectionOrders = (
  inspectionId: number
): Promise<InspectionOrder[]> => {
  return request({ url: `/inspections/${inspectionId}/orders` });
};

const createInspectionOrder = ({
  inspectionId,
  inspectionOrder,
}: {
  inspectionId: number;
  inspectionOrder: InspectionOrderAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/orders`,
    method: "post",
    data: inspectionOrder,
  });
};

const updateInspectionOrder = ({
  inspectionId,
  inspectionOrderId,
  inspectionOrder,
}: {
  inspectionId: number;
  inspectionOrderId: number;
  inspectionOrder: InspectionOrderAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/orders/${inspectionOrderId}`,
    method: "patch",
    data: inspectionOrder,
  });
};

export const inspectionOrderRender = async ({
  inspectionId,
  inspectionOrderId,
  format,
}: {
  inspectionId: number;
  inspectionOrderId: number;
  format: "html" | "pdf";
}) => {
  // If requesting PDF, specify responseType as 'blob'
  const responseType = format === "pdf" ? "blob" : "json";

  return request({
    method: "GET",
    url: `/inspections/${inspectionId}/orders/${inspectionOrderId}/render`,
    params: { output_format: format },
    responseType: responseType,
  });
};

const createOrderApproval = ({
  inspectionId,
  inspectionOrderId,
  approvalPayload,
}: {
  inspectionId: number;
  inspectionOrderId: number;
  approvalPayload: {
    approved_by_id: number;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/orders/${inspectionOrderId}/approvals`,
    method: "post",
    data: approvalPayload,
  });
};

const fetchOrderApprovals = ({
  inspectionId,
  inspectionOrderId,
}: {
  inspectionId: number;
  inspectionOrderId: number;
}): Promise<OrderApproval[]> => {
  return request({
    url: `/inspections/${inspectionId}/orders/${inspectionOrderId}/approvals`,
  });
};

const updateOrderApprovalStatus = ({
  inspectionId,
  inspectionOrderId,
  approvalId,
  statusPayload,
}: {
  inspectionId: number;
  inspectionOrderId: number;
  approvalId: number;
  statusPayload: {
    approval_status: string;
    approved_by_id: number;
  };
}) => {
  return request({
    url: `/inspections/${inspectionId}/orders/${inspectionOrderId}/approvals/${approvalId}/status`,
    method: "patch",
    data: statusPayload,
  });
};

export const useInspectionOrdersData = (inspectionId: number) => {
  return useQuery({
    queryKey: ["inspection-orders", inspectionId],
    queryFn: () => fetchInspectionOrders(inspectionId),
    enabled: !!inspectionId,
    staleTime: Infinity,
  });
};

export const useCreateInspectionOrder = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createInspectionOrder, onSuccess });
};

export const useUpdateInspectionOrder = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateInspectionOrder, onSuccess });
};

export const useInspectionOrderRendered = (
  inspectionId: number,
  inspectionOrderId: number,
  format: "html" | "pdf",
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "inspection-order-rendered",
      inspectionId,
      inspectionOrderId,
      format,
    ],
    queryFn: () =>
      inspectionOrderRender({
        inspectionId,
        inspectionOrderId,
        format,
      }),
    enabled: !!inspectionId && !!inspectionOrderId && isEnabled,
    refetchOnWindowFocus: false,
  });
};

export const useCreateOrderApproval = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: createOrderApproval,
    onSuccess,
  });
};

export const useFetchOrderApprovals = (
  inspectionId: number,
  inspectionOrderId: number
) => {
  return useQuery({
    queryKey: ["order-approvals", inspectionId, inspectionOrderId],
    queryFn: () => fetchOrderApprovals({ inspectionId, inspectionOrderId }),
    enabled: !!inspectionId && !!inspectionOrderId,
  });
};

export const useUpdateOrderApprovalStatus = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: updateOrderApprovalStatus,
    onSuccess,
  });
};
