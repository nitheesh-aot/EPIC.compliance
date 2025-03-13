import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Reorder } from "framer-motion";
import React, { useCallback, useEffect } from "react";
import RequirementCard from "./Requirements/RequirementCard";
import {
  REGULATORY_CONSIDERATION_TYPE_ID,
  REQUIREMENT_TYPE_ID,
} from "./Requirements/RequirementUtils";
import { DRAWER_WIDTHS } from "@/utils/constants";

interface InspectionRequirementsProps {
  inspectionData: Inspection;
}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = ({
  inspectionData,
}) => {
  const queryClient = useQueryClient();
  const { setOpen, isOpen, setClose } = useDrawer();
  const [activeRequirementId, setActiveRequirementId] = React.useState<
    number | null
  >(null);
  const [inspectionRequirements, setInspectionRequirements] = React.useState<
    InspectionRequirement[]
  >([]);
  const [regulatoryConsideration, setRegulatoryConsideration] =
    React.useState<InspectionRequirement | null>(null);

  const { data: inspectionRequirementsData } = useInspectionRequirementsData(
    inspectionData.id
  );

  useEffect(() => {
    if (inspectionRequirementsData) {
      setInspectionRequirements(
        inspectionRequirementsData.filter(
          (req) => req.req_type?.id === REQUIREMENT_TYPE_ID
        )
      );
      setRegulatoryConsideration(
        inspectionRequirementsData.find(
          (req) => req.req_type?.id === REGULATORY_CONSIDERATION_TYPE_ID
        ) ?? null
      );
    }
  }, [inspectionRequirementsData]);

  const handleOnSubmit = useCallback(
    (submitMsg: string, isClose: boolean = true) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirements", inspectionData.id],
      });
      notify.success(submitMsg);
      if (isClose) {
        setClose();
      }
    },
    [queryClient, inspectionData, setClose]
  );

  const handleOpenAddRequirementModal = useCallback(() => {
    setOpen({
      content: (
        <RequirementDrawer
          onSubmit={handleOnSubmit}
          inspectionData={inspectionData}
          isRegulatoryConsiderationExists={!!regulatoryConsideration}
        />
      ),
      width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
    });
  }, [setOpen, handleOnSubmit, inspectionData, regulatoryConsideration]);

  const handleOpenEditRequirementModal = useCallback(
    (requirement: InspectionRequirement, index: number) => {
      setActiveRequirementId(requirement.id);
      setOpen({
        content: (
          <RequirementDrawer
            onSubmit={handleOnSubmit}
            inspectionData={inspectionData}
            requirement={requirement}
            index={index}
            isRegulatoryConsiderationExists={!!regulatoryConsideration}
          />
        ),
        width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
      });
    },
    [setOpen, handleOnSubmit, inspectionData, regulatoryConsideration]
  );

  React.useEffect(() => {
    if (!isOpen) {
      setActiveRequirementId(null);
    }
  }, [isOpen]);

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
          data-cy="new-requirement-button"
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
      {regulatoryConsideration && (
        <RequirementCard
          key={regulatoryConsideration.id}
          requirement={regulatoryConsideration}
          index={inspectionRequirements.length}
          onEdit={() =>
            handleOpenEditRequirementModal(
              regulatoryConsideration,
              inspectionRequirements.length
            )
          }
          isActive={regulatoryConsideration.id === activeRequirementId}
        />
      )}
    </Box>
  );
};

export default InspectionRequirements;
