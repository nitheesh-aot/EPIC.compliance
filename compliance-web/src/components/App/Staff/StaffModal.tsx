import ModalCloseIconButton from "@/components/Shared/Modals/ModalCloseIconButton";
import {
  usePermissionsData,
  usePositionsData,
  useAuthUsersData,
  useAddStaff,
  useUpdateStaff,
} from "@/hooks/useStaff";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { StaffAPIData, StaffFormData, StaffUser } from "@/models/Staff";
import { useModal } from "@/store/modalStore";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import StaffForm from "./StaffForm";
import { AuthUser } from "@/models/AuthUser";
import { notify } from "@/store/snackbarStore";
import { AxiosError } from "axios";

type StaffModalProps = {
  onSubmit: (submitMsg: string) => void;
  staff?: StaffUser;
};

const initFormData: Omit<StaffFormData, "id"> = {
  name: null,
  position: null,
  deputyDirector: null,
  supervisor: null,
  permission: null,
};

const StaffModal: React.FC<StaffModalProps> = ({ onSubmit, staff }) => {
  const [formData, setFormData] =
    useState<Omit<StaffFormData, "id">>(initFormData);
  const { setClose } = useModal();

  const { data: usersList } = useAuthUsersData();
  const { data: positionsList } = usePositionsData();
  const { data: permissionsList } = usePermissionsData();

  useEffect(() => {
    if (staff) {
      setFormData({
        name:
          usersList?.find((item) => item.username === staff.auth_user_guid) ||
          null,
        position: staff.position || null,
        permission:
          permissionsList?.find((item) => item.id === staff.permission) || null,
        deputyDirector: null,
        supervisor: null,
      });
    } else {
      setFormData(initFormData);
    }
  }, [permissionsList, positionsList, staff, usersList]);

  const onSuccess = () => {
    onSubmit(staff ? "Successfully updated!" : "Successfully added!");
  };

  const onError = (err: AxiosError) => {
    notify.error(err?.message);
  };

  const { mutate: addStaff, reset: resetAddStaff } = useAddStaff(
    onSuccess,
    onError
  );

  const { mutate: updateStaff, reset: resetUpdateStaff } = useUpdateStaff(
    onSuccess,
    onError
  );

  const handleAutocompleteChange =
    (key: keyof StaffFormData) =>
    (
      _event: React.SyntheticEvent,
      newVal: Position | Permission | AuthUser | null
    ) => {
      setFormData((prevValues) => ({ ...prevValues, [key]: newVal }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const staffData: StaffAPIData = {
      auth_user_guid: formData.name?.username ?? "",
      permission: formData.permission?.id ?? "",
      position_id: formData.position?.id ?? "",
      deputy_director_id: formData.deputyDirector?.username,
      supervisor_id: formData.supervisor?.username,
    };
    if (staff) {
      updateStaff({ id: staff.id, staff: staffData });
    } else {
      addStaff(staffData);
    }
  };

  const handleClose = () => {
    staff ? resetUpdateStaff() : resetAddStaff();
    setFormData(initFormData);
    setClose();
  };

  return (
    <Box width="520px">
      <DialogTitle>
        {staff
          ? `${formData.name?.first_name} ${formData.name?.last_name}`
          : "Add Staff Member"}
      </DialogTitle>
      <ModalCloseIconButton handleClose={handleClose} />
      <Divider />
      <DialogContent>
        <StaffForm
          formData={formData}
          existingStaff={staff}
          handleAutocompleteChange={handleAutocompleteChange}
          authUsersList={usersList}
          positionsList={positionsList}
          permissionsList={permissionsList}
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ paddingX: "1.5rem", paddingY: "1rem" }}>
        <Button variant={"text"} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant={"contained"} onClick={handleSubmit}>
          {staff ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default StaffModal;
