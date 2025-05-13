import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import RequirementLoading from "./Requirements/RequirementLoading";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import EnforcementNotificationCard from "./Enforcements/EnforcementNotificationCard";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { EnforcementActionEnum } from "@/utils/constants";
import { useModal } from "@/store/modalStore";
import EnforcementModal from "./Enforcements/EnforcementModal";
import { notify } from "@/store/snackbarStore";
interface InspectionEnforcementsProps {
  inspectionData: Inspection;
}

const InspectionEnforcements: React.FC<InspectionEnforcementsProps> = ({
  inspectionData,
}) => {
  const { setOpen, setClose } = useModal();
  const [isDataLoading, setIsDataLoading] = React.useState<boolean>(true);
  const [requirementEnforcements, setRequirementEnforcements] = React.useState<
    InspectionRequirement[]
  >([]);

  const {
    data: inspectionRequirementsData,
    isLoading: isInspectionRequirementsLoading,
  } = useInspectionRequirementsData(inspectionData.id);

  useEffect(() => {
    if (!isInspectionRequirementsLoading) {
      setIsDataLoading(false);
    }
  }, [isInspectionRequirementsLoading, inspectionRequirementsData]);

  useEffect(() => {
    if (inspectionRequirementsData) {
      // filter requirements with enforcement actions as order or warning letter
      setRequirementEnforcements(
        inspectionRequirementsData.filter(
          (requirement) =>
            requirement.enforcement_action_data?.length &&
            requirement.enforcement_action_data.some((enforcement) =>
              [
                EnforcementActionEnum.WARNING_LETTER,
                EnforcementActionEnum.ORDER,
              ].includes(enforcement.id as EnforcementActionEnum)
            )
        )
      );
    }
  }, [inspectionRequirementsData]);

  const actionsList = [
    {
      text: "Warning Letter",
      onClick: () => {
        setOpen({
          content: (
            <EnforcementModal
              inspectionId={inspectionData.id}
              enforcementType={EnforcementActionEnum.WARNING_LETTER}
              requirementsList={requirementEnforcements}
              onSubmit={(message) => {
                notify.success(message);
                setClose();
              }}
            />
          ),
        });
      },
    },
    {
      text: "Order",
      onClick: () => {
        setOpen({
          content: (
            <EnforcementModal
              inspectionId={inspectionData.id}
              enforcementType={EnforcementActionEnum.ORDER}
              requirementsList={requirementEnforcements}
              onSubmit={(message) => {
                notify.success(message);
                setClose();
              }}
            />
          ),
        });
      },
    },
    {
      text: "Administrative Penalty Recommendation",
      onClick: () => {},
    },
    {
      text: "Charge (Report to Crown Council)",
      onClick: () => {},
    },
  ];

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      overflow={"auto"}
    >
      <Box display={"flex"} justifyContent={"space-between"} mt={3} mb={2}>
        <Typography variant="h6">Enforcement</Typography>
        {!isDataLoading && (
          <MenuActionDropdown
            buttonText="New Enforcement"
            actions={actionsList}
            menuWidth="auto"
          />
        )}
      </Box>
      {isDataLoading ? (
        // TODO: change to enforcement loading
        <RequirementLoading />
      ) : (
        requirementEnforcements.map((requirement) => (
          <EnforcementNotificationCard
            key={requirement.id}
            requirement={requirement}
          />
        ))
      )}
    </Box>
  );
};

export default InspectionEnforcements;
