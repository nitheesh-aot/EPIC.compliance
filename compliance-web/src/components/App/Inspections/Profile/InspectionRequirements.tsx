import React, { useCallback } from "react";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { Inspection } from "@/models/Inspection";
import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import RequirementCard from "./Requirements/RequirementCard";
import { useQueryClient } from "@tanstack/react-query";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { Reorder } from "framer-motion";

interface InspectionRequirementsProps {
  inspectionData: Inspection;
}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = ({
  inspectionData,
}) => {
  const queryClient = useQueryClient();
  const { setOpen } = useDrawer();
  const [activeRequirementId, setActiveRequirementId] = React.useState<
    number | null
  >(null);
  const [inspectionRequirements, setInspectionRequirements] = React.useState<
    InspectionRequirement[]
  >([]);

  const { data: inspectionRequirementsData } = useInspectionRequirementsData(
    inspectionData.id
  );

  React.useEffect(() => {
    if (inspectionRequirementsData) {
      setInspectionRequirements(inspectionRequirementsData);
    }
  }, [inspectionRequirementsData]);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirements", inspectionData.id],
      });
      notify.success(submitMsg);
    },
    [queryClient, inspectionData]
  );

  const handleOpenAddRequirementModal = useCallback(() => {
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

  const handleOpenEditRequirementModal = useCallback(
    (requirement: InspectionRequirement, index: number) => {
      setActiveRequirementId(requirement.id);
      setOpen({
        content: (
          <RequirementDrawer
            onSubmit={(submitMsg) => {
              setActiveRequirementId(null);
              handleOnSubmit(submitMsg);
            }}
            inspectionData={inspectionData}
            requirement={requirement}
            index={index}
          />
        ),
        width: "1228px",
      });
    },
    [setOpen, handleOnSubmit, inspectionData]
  );

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
          onClick={handleOpenAddRequirementModal}
          startIcon={<AddRounded />}
        >
          New Requirement
        </Button>
      </Box>
      <Reorder.Group
        axis="y"
        onReorder={setInspectionRequirements}
        values={inspectionRequirements}
        className="reorder-list"
      >
        {inspectionRequirements?.map((requirement, index) => (
          <RequirementCard
            key={requirement.id}
            requirement={requirement}
            index={index}
            onEdit={() => handleOpenEditRequirementModal(requirement, index)}
            isActive={requirement.id === activeRequirementId}
          />
        ))}
      </Reorder.Group>
    </Box>
  );
};

export default InspectionRequirements;
