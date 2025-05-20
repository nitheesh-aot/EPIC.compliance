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
