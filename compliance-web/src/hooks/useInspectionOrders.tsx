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
  return request({ url: `/orders`, params: { inspection_id: inspectionId } });
};

const createInspectionOrder = ({
  inspectionOrder,
}: {
  inspectionOrder: InspectionOrderAPIData;
}) => {
  return request({
    url: `/orders`,
    method: "post",
    data: inspectionOrder,
  });
};

const updateInspectionOrder = ({
  inspectionOrderId,
  inspectionOrder,
}: {
  inspectionOrderId: number;
  inspectionOrder: InspectionOrderAPIData;
}) => {
  return request({
    url: `/orders/${inspectionOrderId}`,
    method: "patch",
    data: inspectionOrder,
  });
};

export const inspectionOrderRender = async ({
  inspectionOrderId,
  format,
}: {
  inspectionOrderId: number;
  format: "html" | "pdf";
}) => {
  // If requesting PDF, specify responseType as 'blob'
  const responseType = format === "pdf" ? "blob" : "json";

  return request({
    method: "GET",
    url: `/orders/${inspectionOrderId}/render`,
    params: { output_format: format },
    responseType: responseType,
  });
};

const createOrderApproval = ({
  inspectionOrderId,
  approvalPayload,
}: {
  inspectionOrderId: number;
  approvalPayload: {
    approved_by_id: number;
  };
}) => {
  return request({
    url: `/orders/${inspectionOrderId}/approvals`,
    method: "post",
    data: approvalPayload,
  });
};

const fetchOrderApprovals = ({
  inspectionOrderId,
}: {
  inspectionOrderId: number;
}): Promise<OrderApproval[]> => {
  return request({
    url: `/orders/${inspectionOrderId}/approvals`,
  });
};

const updateOrderApprovalStatus = ({
  inspectionOrderId,
  approvalId,
  statusPayload,
}: {
  inspectionOrderId: number;
  approvalId: number;
  statusPayload: {
    approval_status: string;
    approved_by_id: number;
  };
}) => {
  return request({
    url: `/orders/${inspectionOrderId}/approvals/${approvalId}/status`,
    method: "patch",
    data: statusPayload,
  });
};

const issueOrder = ({
  inspectionOrderId,
  issuePayload,
}: {
  inspectionOrderId: number;
  issuePayload: {
    date_issued: string;
  };
}) => {
  return request({
    url: `/orders/${inspectionOrderId}/issue`,
    method: "patch",
    data: issuePayload,
  });
};

const deleteInspectionOrder = ({
  inspectionOrderId,
}: {
  inspectionOrderId: number;
}) => {
  return request({
    url: `/orders/${inspectionOrderId}`,
    method: "delete",
  });
};

const updateOrderStatus = ({
  inspectionOrderId,
  statusPayload,
}: {
  inspectionOrderId: number;
  statusPayload: {
    status: string;
  };
}) => {
  return request({
    url: `/orders/${inspectionOrderId}/status`,
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
  inspectionOrderId: number,
  format: "html" | "pdf",
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: ["inspection-order-rendered", inspectionOrderId, format],
    queryFn: () =>
      inspectionOrderRender({
        inspectionOrderId,
        format,
      }),
    enabled: !!inspectionOrderId && isEnabled,
    refetchOnWindowFocus: false,
  });
};

export const useCreateOrderApproval = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: createOrderApproval,
    onSuccess,
  });
};

export const useFetchOrderApprovals = (inspectionOrderId: number) => {
  return useQuery({
    queryKey: ["order-approvals", inspectionOrderId],
    queryFn: () => fetchOrderApprovals({ inspectionOrderId }),
    enabled: !!inspectionOrderId,
    staleTime: Infinity,
  });
};

export const useUpdateOrderApprovalStatus = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: updateOrderApprovalStatus,
    onSuccess,
  });
};

export const useIssueOrder = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: issueOrder,
    onSuccess,
  });
};

export const useDeleteInspectionOrder = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: deleteInspectionOrder,
    onSuccess,
  });
};

export const useUpdateOrderStatus = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess,
  });
};
