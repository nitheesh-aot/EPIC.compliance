import React from "react";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { StaffFormData as StaffFormModel, StaffUser } from "@/models/Staff";
import { AuthUser } from "@/models/AuthUser";

type StaffFormProps = {
  formData: Omit<StaffFormModel, "id">;
  handleAutocompleteChange: (
    key: keyof StaffFormModel
  ) => (
    _event: React.SyntheticEvent,
    newVal: Position | Permission | AuthUser | null
  ) => void;
  existingStaff?: StaffUser;
  authUsersList?: AuthUser[];
  positionsList?: Position[];
  permissionsList?: Permission[];
};

const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  existingStaff,
  handleAutocompleteChange,
  permissionsList,
  positionsList,
  authUsersList,
}) => {
  return (
    <>
      <Autocomplete
        id="name"
        options={authUsersList ?? []}
        onChange={handleAutocompleteChange("name")}
        getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={formData.name}
        disabled={!!existingStaff}
        renderInput={(params) => (
          <TextField {...params} label="Name" name="name" />
        )}
      />
      <Autocomplete
        id="position"
        options={positionsList ?? []}
        onChange={handleAutocompleteChange("position")}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={formData.position}
        renderInput={(params) => (
          <TextField {...params} label="Position" name="position" />
        )}
      />
      <Stack direction="row" spacing={1}>
        <Autocomplete
          id="deputyDirector"
          options={authUsersList ?? []}
          onChange={handleAutocompleteChange("deputyDirector")}
          getOptionLabel={(option) =>
            `${option.first_name} ${option.last_name}`
          }
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={formData.deputyDirector}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Deputy Director"
              name="deputyDirector"
            />
          )}
          fullWidth
        />
        <Autocomplete
          id="supervisor"
          options={authUsersList ?? []}
          onChange={handleAutocompleteChange("supervisor")}
          getOptionLabel={(option) =>
            `${option.first_name} ${option.last_name}`
          }
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={formData.supervisor}
          renderInput={(params) => (
            <TextField {...params} label="Supervisor" name="supervisor" />
          )}
          fullWidth
        />
      </Stack>
      <Autocomplete
        id="permission"
        options={permissionsList ?? []}
        onChange={handleAutocompleteChange("permission")}
        getOptionLabel={(option) => option.name}
        value={formData.permission}
        renderInput={(params) => (
          <TextField {...params} label="Permission" name="permission" />
        )}
      />
    </>
  );
};

export default StaffForm;
