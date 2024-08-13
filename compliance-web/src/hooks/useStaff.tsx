import { useQuery } from "@tanstack/react-query";
import { request } from "@/utils/axiosUtils";
import { Position } from "@/models/Position";
import { Permission } from "@/models/Permission";

export interface MockUser {
  id: number;
  name: string;
}

const mockUsersList: MockUser[] = [
  { name: "Shawn", id: 1 },
  { name: "Ryan", id: 2 },
  { name: "Hugh", id: 3 },
  { name: "Blake", id: 4 },
];

const fetchStaffUsers = (): Promise<MockUser[]> => {
  // return request({ url: "/staff-users" });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsersList);
    }, 300);
  });
};

const fetchPositions = (): Promise<Position[]> => {
  return request({ url: "/positions" });
};

const fetchPermissions = (): Promise<Permission[]> => {
  return request({ url: "/staff-users/permissions" });
};

const fetchDeputyDirectors = (): Promise<MockUser[]> => {
  // return request({ url: "/staff-users" });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsersList);
    }, 300);
  });
};

const fetchSupervisors = (): Promise<MockUser[]> => {
  // return request({ url: "/staff-users" });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsersList);
    }, 300);
  });
};

export const useStaffUsersData = () => {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: fetchStaffUsers,
  });
};

export const usePositionsData = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
  });
};

export const usePermissionsData = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });
};

export const useDeputyDirectorsData = () => {
  return useQuery({
    queryKey: ["deputy-directors"],
    queryFn: fetchDeputyDirectors,
  });
};

export const useSupervisorsData = () => {
  return useQuery({
    queryKey: ["supervisors"],
    queryFn: fetchSupervisors,
  });
};
