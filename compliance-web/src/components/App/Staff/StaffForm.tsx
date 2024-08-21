import React from "react";
import { Stack } from "@mui/material";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { StaffUser } from "@/models/Staff";
import { AuthUser } from "@/models/AuthUser";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";

type StaffFormProps = {
  existingStaff?: StaffUser;
  authUsersList?: AuthUser[];
  positionsList?: Position[];
  permissionsList?: Permission[];
  staffUsersList?: StaffUser[];
};

const StaffForm: React.FC<StaffFormProps> = ({
  existingStaff,
  permissionsList,
  positionsList,
  authUsersList,
  staffUsersList,
}) => {
  return (
    <>
      <ControlledAutoComplete
        name="name"
        label="Name"
        options={authUsersList ?? []}
        getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disabled={!!existingStaff}
      />
      <ControlledAutoComplete
        name="position"
        label="Position"
        options={positionsList ?? []}
        getOptionLabel={(option) => option.name}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
      <Stack direction="row" spacing={1}>
        <ControlledAutoComplete
          name="deputyDirector"
          label="Deputy Director"
          options={staffUsersList ?? []}
          getOptionLabel={(option) => option.full_name ?? ""}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          fullWidth
        />
        <ControlledAutoComplete
          name="supervisor"
          label="Supervisor"
          options={staffUsersList ?? []}
          getOptionLabel={(option) => option.full_name ?? ""}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          fullWidth
        />
      </Stack>
      <ControlledAutoComplete
        name="permission"
        label="Permission"
        options={permissionsList ?? []}
        getOptionLabel={(option) => option.name}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </>
  );
};

export default StaffForm;
