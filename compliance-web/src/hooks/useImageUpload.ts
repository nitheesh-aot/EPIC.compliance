import { OnSuccessType, requestAxios, requestDocumentAPI } from "@/utils/axiosUtils";
import { useMutation } from "@tanstack/react-query";
import { ImageUploadAPIData, PresignedUrlRequestPayload } from "@/models/Image";

const getPresignedUrl = (requestPayload: PresignedUrlRequestPayload) => {
  return requestDocumentAPI({ url: "/storage-operations/presigned-urls", method: "post", data: requestPayload });
};

const uploadFile = (presignedUrl: string, file: File) => {
  return requestAxios({
    url: presignedUrl,
    method: "put",
    data: file,
    headers: {
      "Content-Type": file.type,
    }
  });
};

export const useImageUpload = (onSuccess: OnSuccessType) => {
  return useMutation({
    mutationFn: async (imageData: ImageUploadAPIData) => {
      const presignedUrlData = await getPresignedUrl({
        relative_url: `compliance/inspections/${imageData.inspectionId}/requirements-images/${imageData.fileName}`,
      });
      console.log("presignedUrlData", presignedUrlData, imageData.file, imageData.file.bytes);
      const { data: uploadData } = await uploadFile(presignedUrlData.presigned_url, imageData.file);
      console.log("uploadData", uploadData);
      return uploadData;
    },
    onSuccess,
  });
};
