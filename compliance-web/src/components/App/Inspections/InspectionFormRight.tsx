import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import { FC, useState } from "react";
import { Attendance } from "@/models/Attendance";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { BCDesignTokens } from "epic.theme";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";

type InspectionFormRightProps = {
  irStatusList: IRStatus[];
  projectStatusList: ProjectStatus[];
  attendanceList: Attendance[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
};

type FieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const InspectionFormRight: FC<InspectionFormRightProps> = ({
  irStatusList,
  projectStatusList,
  attendanceList,
  agenciesList,
  firstNationsList,
}) => {
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance[]>(
    []
  );

  const handleAttendanceChange = (
    _event: React.SyntheticEvent,
    selected: Attendance | Attendance[] | null
  ) => {
    setSelectedAttendance(selected as Attendance[]);
  };

  const dynamicFieldConfig: Record<string, FieldConfig> = {
    Municipal: { type: "text", name: "municipal", label: "Municipal" },
    Other: { type: "text", name: "other", label: "Other" },
    "First Nations": {
      type: "autocomplete",
      name: "firstNations",
      label: "First Nations",
      options: firstNationsList,
    },
    Agencies: {
      type: "autocomplete",
      name: "agencies",
      label: "Agencies",
      options: agenciesList,
    },
  };

  return (
    <>
      <Box
        sx={{
          width: "399px",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <Stack>
          <Box p={sectionPadding}>
            <ControlledAutoComplete
              name="irStatus"
              label="IR Status (optional)"
              options={irStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="projectStatus"
              label="Project Status (optional)"
              options={projectStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="inAttendance"
              label="In Attendance (optional)"
              options={attendanceList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              fullWidth
              onChange={handleAttendanceChange}
            />
          </Box>
          {/* Show this section only if in-attendance is selected */}
          {selectedAttendance?.length > 0 && (
            <Box
              p={sectionPadding}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              {selectedAttendance.map((attendee) => {
                const config = dynamicFieldConfig[attendee.name];
                if (!config) return null;

                return config.type === "text" ? (
                  <ControlledTextField
                    key={config.name}
                    name={config.name}
                    label={config.label}
                    placeholder={`Type ${config.label.toLowerCase()} attendees`}
                    fullWidth
                    multiline
                  />
                ) : (
                  <ControlledAutoComplete
                    key={config.name}
                    name={config.name}
                    label={config.label}
                    options={config.options ?? []}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    multiple
                    fullWidth
                  />
                );
              })}
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default InspectionFormRight;
