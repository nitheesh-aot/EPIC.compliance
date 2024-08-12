import React from "react";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { MockUser } from "@/hooks/useStaff";
import { Permission } from "@/models/Permission";
import { Position } from "@/models/Position";
import { Staff, StaffFormData as StaffFormModel } from "@/models/Staff";

type StaffFormProps = {
  formData: Omit<StaffFormModel, "id">;
  handleAutocompleteChange: (
    key: keyof StaffFormModel
  ) => (
    _event: React.SyntheticEvent,
    newVal: MockUser | Position | Permission | null
  ) => void;
  existingStaff?: Staff;
  staffUsersList?: MockUser[];
  positionsList?: Position[];
  permissionsList?: Permission[];
  deputyDirectorsList?: MockUser[];
  supervisorsList?: MockUser[];
};

const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  existingStaff,
  handleAutocompleteChange,
  deputyDirectorsList,
  permissionsList,
  positionsList,
  staffUsersList,
  supervisorsList,
}) => {
  return (
    <>
      <Autocomplete
        id="name"
        options={staffUsersList ?? []}
        onChange={handleAutocompleteChange("name")}
        getOptionLabel={(option) => option.name}
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
        value={formData.position}
        renderInput={(params) => (
          <TextField {...params} label="Position" name="position" />
        )}
      />
      <Stack direction="row" spacing={1}>
        <Autocomplete
          id="deputyDirector"
          options={deputyDirectorsList ?? []}
          onChange={handleAutocompleteChange("deputyDirector")}
          getOptionLabel={(option) => option.name}
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
          options={supervisorsList ?? []}
          onChange={handleAutocompleteChange("supervisor")}
          getOptionLabel={(option) => option.name}
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
