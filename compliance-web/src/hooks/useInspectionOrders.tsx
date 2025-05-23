import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionOrder,
  InspectionOrderAPIData,
} from "@/models/InspectionOrder";

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
