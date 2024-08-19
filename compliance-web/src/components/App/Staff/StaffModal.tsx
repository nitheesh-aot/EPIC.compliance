import ModalCloseIconButton from "@/components/Shared/Modals/ModalCloseIconButton";
import {
  usePermissionsData,
  usePositionsData,
  useAuthUsersData,
  useAddStaff,
} from "@/hooks/useStaff";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { Staff, StaffAPIData, StaffFormData } from "@/models/Staff";
import { useModal } from "@/store/modalStore";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useState } from "react";
import StaffForm from "./StaffForm";
import { AuthUser } from "@/models/AuthUser";
import { notify } from "@/store/snackbarStore";
import { AxiosError } from "axios";

type StaffModalProps = {
  onSubmit: () => void;
  staff: Staff | undefined;
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

  // useEffect(() => {
  //   if (staff) {
  //     setFormData({
  //       name: usersList?.find((item) => item.id === staff.name) || null,
  //       position:
  //         positionsList?.find((item) => item.id === staff.position) || null,
  //       permission:
  //         permissionsList?.find((item) => item.id === staff.permission) || null,
  //       deputyDirector:
  //         deputyDirectorsList?.find(
  //           (item) => item.id === staff.deputyDirector
  //         ) || null,
  //       supervisor:
  //         supervisorsList?.find((item) => item.id === staff.supervisor) || null,
  //     });
  //   } else {
  //     setFormData(initFormData);
  //   }
  // }, [
  //   deputyDirectorsList,
  //   permissionsList,
  //   positionsList,
  //   staff,
  //   usersList,
  //   supervisorsList,
  // ]);

  const onSuccess = () => {
    onSubmit();
  };

  const onError = (err: AxiosError) => {
    // eslint-disable-next-line no-console
    console.log(typeof err);
    notify.error(err?.message);
  };

  const { mutate: addStaff, reset: resetAddStaff } = useAddStaff(
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
    // eslint-disable-next-line no-console
    console.log(formData);
    const staffData: StaffAPIData = {
      auth_user_guid: formData.name?.username ?? "",
      permission: formData.permission?.id ?? "",
      position_id: formData.position?.id ?? "",
    };
    if (staff) {
      // updateUser({ ...user, ...formData });
    } else {
      addStaff(staffData);
    }
    onSubmit();
  };

  const handleClose = () => {
    resetAddStaff();
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
