import { Box } from "@mui/material";
import ExternalTableFilter from "@/components/Shared/FilterSelect/ExternalTableFilter";
import { InspectionStatusEnum } from "@/utils/constants";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useProjectsData } from "@/hooks/useProjects";
import { useMemo } from "react";

interface RequirementsExternalFiltersProps {
  onFilterChange: (filterId: string, value: string[] | string) => void;
}

const RequirementsExternalFilters: React.FC<
  RequirementsExternalFiltersProps
> = ({ onFilterChange }) => {
  const { data: staffUsers } = useStaffUsersData();
  const { data: projects } = useProjectsData();

  const inspectionStatusOptions = Object.entries(InspectionStatusEnum).map(
    ([key, value]) => ({
      text: value,
      value: key,
    })
  );

  const primaryOfficerOptions = useMemo(
    () =>
      staffUsers?.map((user) => ({
        text: user.name,
        value: user.id.toString(),
      })) ?? [],
    [staffUsers]
  );

  const projectOptions = useMemo(
    () =>
      projects?.map((project) => ({
        text: project.name,
        value: project.id.toString(),
      })) ?? [],
    [projects]
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ExternalTableFilter
        filterId="primary_officer_id"
        filterOptions={primaryOfficerOptions}
        onFilterChange={onFilterChange}
        placeholder="Primary"
        variant="inline"
        isMulti={false}
        name="primaryOfficerFilter"
      />
      <ExternalTableFilter
        filterId="inspection_status"
        filterOptions={inspectionStatusOptions}
        onFilterChange={onFilterChange}
        placeholder="Inspection Status"
        variant="inline"
        isMulti={false}
        name="inspectionStatusFilter"
      />
      <ExternalTableFilter
        filterId="project_id"
        filterOptions={projectOptions}
        onFilterChange={onFilterChange}
        placeholder="Project"
        variant="inline"
        isMulti={false}
        name="projectFilter"
      />
    </Box>
  );
};

export default RequirementsExternalFilters;
