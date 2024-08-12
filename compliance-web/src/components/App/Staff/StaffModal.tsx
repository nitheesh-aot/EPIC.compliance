import ModalCloseIconButton from "@/components/Shared/Modals/ModalCloseIconButton";
import {
  MockUser,
  useDeputyDirectorsData,
  usePermissionsData,
  usePositionsData,
  useStaffUsersData,
  useSupervisorsData,
} from "@/hooks/useStaff";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { Staff, StaffFormData } from "@/models/Staff";
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

  const { data: staffUsersList } = useStaffUsersData();
  const { data: positionsList } = usePositionsData();
  const { data: permissionsList } = usePermissionsData();
  const { data: deputyDirectorsList } = useDeputyDirectorsData();
  const { data: supervisorsList } = useSupervisorsData();

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staffUsersList?.find((item) => item.id === staff.name) || null,
        position:
          positionsList?.find((item) => item.id === staff.position) || null,
        permission:
          permissionsList?.find((item) => item.id === staff.permission) || null,
        deputyDirector:
          deputyDirectorsList?.find(
            (item) => item.id === staff.deputyDirector
          ) || null,
        supervisor:
          supervisorsList?.find((item) => item.id === staff.supervisor) || null,
      });
    } else {
      setFormData(initFormData);
    }
  }, [
    deputyDirectorsList,
    permissionsList,
    positionsList,
    staff,
    staffUsersList,
    supervisorsList,
  ]);

  const handleAutocompleteChange =
    (key: keyof StaffFormData) =>
    (
      _event: React.SyntheticEvent,
      newVal: MockUser | Position | Permission | null
    ) => {
      setFormData((prevValues) => ({ ...prevValues, [key]: newVal }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log(formData);
    // if (user) {
    //   updateUser({ ...user, ...formData });
    // } else {
    //   addUser(formData);
    // }
    onSubmit();
  };

  const handleClose = () => {
    // reset();
    setFormData(initFormData);
    setClose();
  };

  return (
    <Box width="520px">
      <DialogTitle>
        {staff ? formData.name?.name : "Add Staff Member"}
      </DialogTitle>
      <ModalCloseIconButton handleClose={handleClose} />
      <Divider />
      <DialogContent>
        <StaffForm
          formData={formData}
          existingStaff={staff}
          handleAutocompleteChange={handleAutocompleteChange}
          staffUsersList={staffUsersList}
          positionsList={positionsList}
          permissionsList={permissionsList}
          deputyDirectorsList={deputyDirectorsList}
          supervisorsList={supervisorsList}
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
