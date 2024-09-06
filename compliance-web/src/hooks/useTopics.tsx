import { useMutation, useQuery } from "@tanstack/react-query";
import { OnErrorType, OnSuccessType, request } from "@/utils/axiosUtils";
import { Topic } from "@/models/Topic";

const fetchTopics = (): Promise<Topic[]> => {
  return request({ url: "/topics" });
};

const addTopic = (topic: Omit<Topic, "id">) => {
  return request({ url: "/topics", method: "post", data: topic });
};

const updateTopic = ({
  id,
  topic,
}: {
  id: number;
  topic: Omit<Topic, "id">;
}) => {
  return request({ url: `/topics/${id}`, method: "patch", data: topic });
};

const deleteTopic = (id: number) => {
  return request({ url: `/topics/${id}`, method: "delete" });
};

export const useTopicsData = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
  });
};

export const useAddTopic = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: addTopic,
    onSuccess,
    onError,
  });
};

export const useUpdateTopic = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: updateTopic,
    onSuccess,
    onError,
  });
};

export const useDeleteTopic = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: deleteTopic,
    onSuccess,
    onError,
  });
};
