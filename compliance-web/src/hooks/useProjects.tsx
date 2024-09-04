import { Project } from "@/models/Project";
import { request, requestTrackAPI } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";


const fetchProjects = (): Promise<Project[]> => {
  return request({ url: "/projects" });
};

/** FETCH project details from TRACK API */
const fetchProjectById = (id: number): Promise<Project> => {
  return requestTrackAPI({ url: `/projects/${id}` });
};

export const useProjectsData = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
};

export const useProjectById = (projectId: number) => {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProjectById(projectId),
    enabled: !!projectId,
  });
};
