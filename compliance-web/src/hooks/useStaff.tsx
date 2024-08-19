import { useMutation, useQuery } from "@tanstack/react-query";
import { OnErrorType, OnSuccessType, request, requestAuthAPI } from "@/utils/axiosUtils";
import { Position } from "@/models/Position";
import { Permission } from "@/models/Permission";
import { StaffAPIData, StaffUser } from "@/models/Staff";
import { AuthUser } from "@/models/AuthUser";

const fetchStaffUsers = (): Promise<StaffUser[]> => {
  return request({ url: "/staff-users" });
};

/** FETCH users from AUTH API */
const fetchAuthUsers = (): Promise<AuthUser[]> => {
  return requestAuthAPI({ url: "/users" });
};

const fetchPositions = (): Promise<Position[]> => {
  return request({ url: "/positions" });
};

const fetchPermissions = (): Promise<Permission[]> => {
  return request({ url: "/staff-users/permissions" });
};

const addStaff = (staff: StaffAPIData) => {
  return request({ url: "/staff-users", method: "post", data: staff });
};

export const useStaffUsersData = () => {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: fetchStaffUsers,
  });
};

export const useAuthUsersData = () => {
  return useQuery({
    queryKey: ["auth-users"],
    queryFn: fetchAuthUsers,
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

export const useAddStaff = (
  onSuccess: OnSuccessType,
  onError: OnErrorType
) => {
  return useMutation({
    mutationFn: addStaff,
    onSuccess,
    onError,
  });
};
