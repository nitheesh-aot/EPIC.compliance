import { AuthUser } from "@/models/AuthUser";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { StaffAPIData, StaffUser } from "@/models/Staff";
import { OnSuccessType, request, requestAuthAPI } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

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

const updateStaff = ({ id, staff }: { id: number; staff: StaffAPIData }) => {
  return request({ url: `/staff-users/${id}`, method: "patch", data: staff });
};

const deleteStaff = (id: number) => {
  return request({ url: `/staff-users/${id}`, method: "delete" });
};

export const useStaffUsersData = (
  is_active: boolean | undefined = undefined
) => {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: async () => {
      const staff = await fetchStaffUsers();
      if (is_active === undefined) {
        return staff;
      }
      return staff.filter((p) => p.is_active === is_active);
    },
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

export const useAddStaff = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: addStaff, onSuccess });
};

export const useUpdateStaff = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: updateStaff, onSuccess });
};

export const useDeleteStaff = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: deleteStaff, onSuccess });
};
