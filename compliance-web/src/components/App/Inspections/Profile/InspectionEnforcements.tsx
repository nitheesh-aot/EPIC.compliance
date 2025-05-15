import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import RequirementLoading from "./Requirements/RequirementLoading";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import EnforcementNotificationCard from "./Enforcements/EnforcementNotificationCard";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { EnforcementActionEnum } from "@/utils/constants";
import { useModal } from "@/store/modalStore";
import EnforcementModal from "./Enforcements/EnforcementModal";
import { notify } from "@/store/snackbarStore";
import EnforcementCard from "./Enforcements/EnforcementCard";
import { useInspectionOrdersData } from "@/hooks/useInspectionOrders";
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

  const {
    data: inspectionOrdersData,
    isLoading: isInspectionOrdersLoading,
    refetch: refetchInspectionOrders,
  } = useInspectionOrdersData(inspectionData.id);

  useEffect(() => {
    if (!isInspectionRequirementsLoading && !isInspectionOrdersLoading) {
      setIsDataLoading(false);
    }
  }, [isInspectionRequirementsLoading, isInspectionOrdersLoading]);

  useEffect(() => {
    if (inspectionRequirementsData) {
      // filter requirements with enforcement actions as order or warning letter
      const filteredRequirements = inspectionRequirementsData.filter(
        (requirement) =>
          requirement.enforcement_action_data?.length &&
          requirement.enforcement_action_data.some((enforcement) =>
            [
              EnforcementActionEnum.WARNING_LETTER,
              EnforcementActionEnum.ORDER,
            ].includes(enforcement.id as EnforcementActionEnum)
          )
      );
      setRequirementEnforcements(filteredRequirements);
    }
  }, [inspectionRequirementsData]);

  const nonProceededRequirements = useMemo(() => {
    if (!requirementEnforcements) return [];
    const orderReqIds = inspectionOrdersData?.map((order) =>
      order.order_requirement_maps?.map((map) => map.inspection_requirement_id)
    );
    // Flatten the nested arrays of requirement IDs
    const flattenedOrderReqIds = orderReqIds?.flat() || [];
    const nonProceededRequirements = requirementEnforcements.filter(
      (requirement) => !flattenedOrderReqIds.includes(requirement.id)
    );
    return nonProceededRequirements;
  }, [requirementEnforcements, inspectionOrdersData]);

  const openEnforcementModal = (
    isEnforcementOrder: boolean,
    requirement?: InspectionRequirement
  ) => {
    setOpen({
      content: (
        <EnforcementModal
          inspectionId={inspectionData.id}
          enforcementType={
            isEnforcementOrder
              ? EnforcementActionEnum.ORDER
              : EnforcementActionEnum.WARNING_LETTER
          }
          requirementsList={nonProceededRequirements}
          requirement={requirement}
          onSubmit={(message) => {
            notify.success(message);
            refetchInspectionOrders();
            setClose();
          }}
        />
      ),
    });
  };

  const actionsList = [
    {
      text: "Warning Letter",
      onClick: () => openEnforcementModal(false),
    },
    {
      text: "Order",
      onClick: () => openEnforcementModal(true),
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
        <>
          {nonProceededRequirements.map((requirement) => (
            <EnforcementNotificationCard
              key={requirement.id}
              requirement={requirement}
              openEnforcementModal={(isEnforcementOrder) =>
                openEnforcementModal(isEnforcementOrder, requirement)
              }
            />
          ))}
          {inspectionOrdersData?.map((order) => (
            <EnforcementCard
              key={order.id}
              order={order}
              requirementEnforcements={requirementEnforcements}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default InspectionEnforcements;
