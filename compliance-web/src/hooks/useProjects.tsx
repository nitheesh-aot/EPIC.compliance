import { Project } from "@/models/Project";
import { request } from "@/utils/axiosUtils";
import { useQuery } from "@tanstack/react-query";


const fetchProjects = (): Promise<Project[]> => {
  return request({ url: "/projects" });
};

export const useProjectsData = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
};
