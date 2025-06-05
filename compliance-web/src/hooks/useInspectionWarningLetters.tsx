import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionWarningLetter,
  InspectionWarningLetterAPIData,
} from "@/models/InspectionWarningLetter";

const fetchInspectionWarningLetters = (
  inspectionId: number
): Promise<InspectionWarningLetter[]> => {
  return request({
    url: `/warning-letters`,
    params: { inspection_id: inspectionId },
  });
};

const createInspectionWarningLetter = ({
  inspectionWarningLetter,
}: {
  inspectionWarningLetter: InspectionWarningLetterAPIData;
}) => {
  return request({
    url: `/warning-letters`,
    method: "post",
    data: inspectionWarningLetter,
  });
};

const updateInspectionWarningLetter = ({
  inspectionWarningLetterId,
  inspectionWarningLetter,
}: {
  inspectionWarningLetterId: number;
  inspectionWarningLetter: InspectionWarningLetterAPIData;
}) => {
  return request({
    url: `/warning-letters/${inspectionWarningLetterId}`,
    method: "patch",
    data: inspectionWarningLetter,
  });
};

export const inspectionWarningLetterRender = async ({
  inspectionWarningLetterId,
  format,
}: {
  inspectionWarningLetterId: number;
  format: "html" | "pdf";
}) => {
  // If requesting PDF, specify responseType as 'blob'
  const responseType = format === "pdf" ? "blob" : "json";

  return request({
    method: "GET",
    url: `/warning-letters/${inspectionWarningLetterId}/render`,
    params: { output_format: format },
    responseType: responseType,
  });
};

const deleteInspectionWarningLetter = ({
  inspectionWarningLetterId,
}: {
  inspectionWarningLetterId: number;
}) => {
  return request({
    url: `/warning-letters/${inspectionWarningLetterId}`,
    method: "delete",
  });
};

export const useInspectionWarningLettersData = (inspectionId: number) => {
  return useQuery({
    queryKey: ["inspection-warning-letters", inspectionId],
    queryFn: () => fetchInspectionWarningLetters(inspectionId),
    enabled: !!inspectionId,
    staleTime: Infinity,
  });
};

export const useCreateInspectionWarningLetter = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createInspectionWarningLetter, onSuccess });
};

export const useUpdateInspectionWarningLetter = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateInspectionWarningLetter, onSuccess });
};

export const useInspectionWarningLetterRendered = (
  inspectionWarningLetterId: number,
  format: "html" | "pdf",
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "inspection-warning-letter-rendered",
      inspectionWarningLetterId,
      format,
    ],
    queryFn: () =>
      inspectionWarningLetterRender({
        inspectionWarningLetterId,
        format,
      }),
    enabled: !!inspectionWarningLetterId && isEnabled,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteInspectionWarningLetter = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: deleteInspectionWarningLetter,
    onSuccess,
  });
};
