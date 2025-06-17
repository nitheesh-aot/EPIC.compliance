import { useMutation, useQuery } from "@tanstack/react-query";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { Appendix } from "@/models/Appendix";

const fetchAppendices = (inspectionId: number): Promise<Appendix[]> => {
  return request({ url: `/appendices?inspection_id=${inspectionId}` });
};

const addAppendix = (appendix: Omit<Appendix, "id">) => {
  return request({ url: "/appendices", method: "post", data: appendix });
};

const updateAppendix = ({
  id,
  appendix,
}: {
  id: number;
  appendix: Omit<Appendix, "id">;
}) => {
  return request({ url: `/appendices/${id}`, method: "patch", data: appendix });
};

const deleteAppendix = (id: number) => {
  return request({ url: `/appendices/${id}`, method: "delete" });
};

export const useAppendicesData = (inspectionId: number) => {
  return useQuery({
    queryKey: ["appendices", inspectionId],
    queryFn: () => fetchAppendices(inspectionId),
    select: (data) => {
      return data.sort((a, b) => Number(a.appendix_no) - Number(b.appendix_no));
    },
    staleTime: Infinity,
  });
};

export const useAddAppendix = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: addAppendix, onSuccess });
};

export const useUpdateAppendix = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateAppendix, onSuccess });
};

export const useDeleteAppendix = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: deleteAppendix, onSuccess });
};
