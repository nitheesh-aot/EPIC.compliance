import React, { useCallback } from "react";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { Inspection } from "@/models/Inspection";
import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import RequirementCard from "./Requirements/RequirementCard";

interface InspectionRequirementsProps {
  inspectionData: Inspection;
}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = ({
  inspectionData,
}) => {
  const { setOpen, setClose } = useDrawer();

  const { data: inspectionRequirementsData } = useInspectionRequirementsData(
    inspectionData.id
  );

  // eslint-disable-next-line no-console
  console.log("inspectionRequirementsData", inspectionRequirementsData);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      setClose();
      notify.success(submitMsg);
    },
    [setClose]
  );

  const handleOpenRequirementModal = useCallback(() => {
    setOpen({
      content: (
        <RequirementDrawer
          onSubmit={handleOnSubmit}
          inspectionData={inspectionData}
        />
      ),
      width: "1228px",
    });
  }, [setOpen, handleOnSubmit, inspectionData]);

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      overflow={"auto"}
    >
      <Box display={"flex"} justifyContent={"space-between"} mt={3} mb={2}>
        <Typography variant="h6">Requirements</Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={handleOpenRequirementModal}
          startIcon={<AddRounded />}
        >
          New Requirement
        </Button>
      </Box>
      {inspectionRequirementsData?.map((requirement, index) => (
        <RequirementCard
          key={requirement.id}
          requirement={requirement}
          index={index}
        />
      ))}
    </Box>
  );
};

export default InspectionRequirements;
