import React, { useCallback } from "react";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { Inspection } from "@/models/Inspection";

interface InspectionRequirementsProps {
  inspectionData: Inspection;
}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = ({
  inspectionData,
}) => {
  const { setOpen, setClose } = useDrawer();

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
      <Box display={"flex"} justifyContent={"space-between"} my={3}>
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
    </Box>
  );
};

export default InspectionRequirements;
