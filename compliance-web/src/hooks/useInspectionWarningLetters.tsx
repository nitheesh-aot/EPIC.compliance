import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  InspectionWarningLetter,
  InspectionWarningLetterAPIData,
} from "@/models/InspectionWarningLetter";

const fetchInspectionWarningLetters = (
  inspectionId: number
): Promise<InspectionWarningLetter[]> => {
  return request({ url: `/inspections/${inspectionId}/warning-letters` });
};

const createInspectionWarningLetter = ({
  inspectionId,
  inspectionWarningLetter,
}: {
  inspectionId: number;
  inspectionWarningLetter: InspectionWarningLetterAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/warning-letters`,
    method: "post",
    data: inspectionWarningLetter,
  });
};

const updateInspectionWarningLetter = ({
  inspectionId,
  inspectionWarningLetterId,
  inspectionWarningLetter,
}: {
  inspectionId: number;
  inspectionWarningLetterId: number;
  inspectionWarningLetter: InspectionWarningLetterAPIData;
}) => {
  return request({
    url: `/inspections/${inspectionId}/warning-letters/${inspectionWarningLetterId}`,
    method: "patch",
    data: inspectionWarningLetter,
  });
};

export const inspectionWarningLetterRender = async ({
  inspectionId,
  inspectionWarningLetterId,
  format,
}: {
  inspectionId: number;
  inspectionWarningLetterId: number;
  format: "html" | "pdf";
}) => {
  // If requesting PDF, specify responseType as 'blob'
  const responseType = format === "pdf" ? "blob" : "json";

  return request({
    method: "GET",
    url: `/inspections/${inspectionId}/warning-letters/${inspectionWarningLetterId}/render`,
    params: { output_format: format },
    responseType: responseType,
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
  inspectionId: number,
  inspectionWarningLetterId: number,
  format: "html" | "pdf",
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "inspection-warning-letter-rendered",
      inspectionId,
      inspectionWarningLetterId,
      format,
    ],
    queryFn: () =>
      inspectionWarningLetterRender({
        inspectionId,
        inspectionWarningLetterId,
        format,
      }),
    enabled: !!inspectionId && !!inspectionWarningLetterId && isEnabled,
    refetchOnWindowFocus: false,
  });
};
