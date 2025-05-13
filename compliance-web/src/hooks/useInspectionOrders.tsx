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
