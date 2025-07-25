import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import RequirementLoading from "@/components/App/Inspections/Profile/Requirements/RequirementLoading";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import EnforcementNotificationCard from "@/components/App/Inspections/Profile/Enforcements/EnforcementNotificationCard";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { DRAWER_WIDTHS, EnforcementActionEnum } from "@/utils/constants";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import EnforcementCard from "@/components/App/Inspections/Profile/Enforcements/EnforcementCard";
import { useInspectionOrdersData } from "@/hooks/useInspectionOrders";
import OrderDrawer from "@/components/App/Inspections/Profile/Enforcements/Orders/OrderDrawer";
import { InspectionOrder } from "@/models/InspectionOrder";
import { useDrawer } from "@/store/drawerStore";
import { useInspectionWarningLettersData } from "@/hooks/useInspectionWarningLetters";
import WarningLetterDrawer from "@/components/App/Inspections/Profile/Enforcements/WarningLetters/WarningLetterDrawer";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import { AddRounded } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";
import OrderCreateModal from "@/components/App/Inspections/Profile/Enforcements/Orders/OrderCreateModal";
import WarningLetterCreateModal from "@/components/App/Inspections/Profile/Enforcements/WarningLetters/WarningLetterCreateModal";
import { prepNonProceededRequirements } from "@/components/App/Inspections/Profile/Enforcements/EnforcementUtils";

interface InspectionEnforcementsProps {
  inspectionData: Inspection;
}

const InspectionEnforcements: React.FC<InspectionEnforcementsProps> = ({
  inspectionData,
}) => {
  const queryClient = useQueryClient();
  const { setOpen: setModalOpen, setClose: setModalClose } = useModal();
  const { setOpen: setDrawerOpen, setClose: setDrawerClose } = useDrawer();
  const [isDataLoading, setIsDataLoading] = React.useState<boolean>(true);
  const [requirementEnforcements, setRequirementEnforcements] = React.useState<
    InspectionRequirement[]
  >([]);

  const isEnforcementsAllowed = useMemo(
    () => inspectionData?.inspection_status?.toLowerCase() === "open",
    [inspectionData]
  );

  const { data: caseFile } = useCaseFileByNumber(
    inspectionData.case_file.case_file_number
  );

  const issuingOfficers = useMemo(
    () =>
      [caseFile?.primary_officer, ...(caseFile?.officers || [])].filter(
        (officer) => officer !== undefined
      ),
    [caseFile]
  );

  const {
    data: inspectionRequirementsData,
    isLoading: isInspectionRequirementsLoading,
  } = useInspectionRequirementsData(inspectionData.id);

  const {
    data: inspectionOrdersData,
    isLoading: isInspectionOrdersLoading,
    refetch: refetchInspectionOrders,
  } = useInspectionOrdersData(inspectionData.id);

  const {
    data: inspectionWarningLettersData,
    isLoading: isInspectionWarningLettersLoading,
    refetch: refetchInspectionWarningLetters,
  } = useInspectionWarningLettersData(inspectionData.id);

  useEffect(() => {
    if (
      !isInspectionRequirementsLoading &&
      !isInspectionOrdersLoading &&
      !isInspectionWarningLettersLoading
    ) {
      setIsDataLoading(false);
    }
  }, [
    isInspectionRequirementsLoading,
    isInspectionOrdersLoading,
    isInspectionWarningLettersLoading,
  ]);

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

  const nonProceededOrderRequirements = useMemo(() => {
    if (!requirementEnforcements) return [];
    const orderReqIds = inspectionOrdersData?.map((order) =>
      order.order_requirement_maps?.map((map) => map.inspection_requirement_id)
    );
    return prepNonProceededRequirements({
      requirements: requirementEnforcements,
      reqIds: orderReqIds,
      enforcementActionType: EnforcementActionEnum.ORDER,
    });
  }, [requirementEnforcements, inspectionOrdersData]);

  const nonProceededWarningLetterRequirements = useMemo(() => {
    if (!requirementEnforcements) return [];
    const warningLetterReqIds = inspectionWarningLettersData?.map(
      (warningLetter) =>
        warningLetter.warning_letter_requirement_maps?.map(
          (map) => map.inspection_requirement_id
        )
    );
    return prepNonProceededRequirements({
      requirements: requirementEnforcements,
      reqIds: warningLetterReqIds,
      enforcementActionType: EnforcementActionEnum.WARNING_LETTER,
    });
  }, [requirementEnforcements, inspectionWarningLettersData]);

  const openEnforcementModal = (
    modelType: EnforcementActionEnum,
    requirement?: InspectionRequirement
  ) => {
    const content =
      modelType === EnforcementActionEnum.ORDER ? (
        <OrderCreateModal
          inspectionData={inspectionData}
          requirementsList={nonProceededOrderRequirements}
          requirement={requirement}
          onSubmit={(data) => {
            openEnforcementOrderDrawer(data);
            setModalClose();
          }}
        />
      ) : (
        <WarningLetterCreateModal
          inspectionData={inspectionData}
          requirementsList={nonProceededWarningLetterRequirements}
          requirement={requirement}
          onSubmit={(data) => {
            openEnforcementWarningLetterDrawer(data);
            setModalClose();
          }}
        />
      );

    setModalOpen({
      content,
    });
  };

  const actionsList = [
    {
      text: "Warning Letter",
      onClick: () => openEnforcementModal(EnforcementActionEnum.WARNING_LETTER),
    },
    {
      text: "Order",
      onClick: () => openEnforcementModal(EnforcementActionEnum.ORDER),
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

  const openEnforcementOrderDrawer = (order: InspectionOrder) => {
    setDrawerOpen({
      content: (
        <OrderDrawer
          onSubmit={(message, isCloseDrawer) => {
            notify.success(message);
            refetchInspectionOrders();
            queryClient.invalidateQueries({
              queryKey: [
                "inspection-orders-projectwise",
                inspectionData.case_file_id,
              ],
            });
            if (isCloseDrawer) {
              setDrawerClose();
            }
          }}
          inspection={inspectionData}
          enforcementOrder={order}
          staffUsersList={issuingOfficers || []}
          isReadonlyMode={!isEnforcementsAllowed}
        />
      ),
      width: DRAWER_WIDTHS.ENFORCEMENT_DRAWER,
    });
  };

  const openEnforcementWarningLetterDrawer = (
    warningLetter: InspectionWarningLetter
  ) => {
    setDrawerOpen({
      content: (
        <WarningLetterDrawer
          onSubmit={(message, isCloseDrawer) => {
            notify.success(message);
            refetchInspectionWarningLetters();
            if (isCloseDrawer) {
              setDrawerClose();
            }
          }}
          inspection={inspectionData}
          warningLetter={warningLetter}
          staffUsersList={issuingOfficers || []}
          isReadonlyMode={!isEnforcementsAllowed}
        />
      ),
      width: DRAWER_WIDTHS.ENFORCEMENT_DRAWER,
    });
  };

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      overflow={"auto"}
    >
      <Box display={"flex"} justifyContent={"space-between"} mt={3} mb={2}>
        <Typography variant="h6">Enforcement</Typography>
        {!isDataLoading && isEnforcementsAllowed && (
          <MenuActionDropdown
            buttonText="New Enforcement"
            actions={actionsList}
            menuWidth="auto"
            menuIcon={<AddRounded />}
          />
        )}
      </Box>
      {isDataLoading ? (
        // TODO: change to enforcement loading
        <RequirementLoading />
      ) : (
        <>
          {isEnforcementsAllowed &&
            [
              ...nonProceededOrderRequirements,
              ...nonProceededWarningLetterRequirements,
            ].map((requirement) => (
              <EnforcementNotificationCard
                key={requirement.id}
                requirement={requirement}
                openEnforcementModal={(modelType) =>
                  openEnforcementModal(modelType, requirement)
                }
              />
            ))}
          {inspectionOrdersData?.map((order) => (
            <Box
              key={order.id}
              onClick={() => openEnforcementOrderDrawer(order)}
            >
              <EnforcementCard
                order={order}
                requirementEnforcements={requirementEnforcements}
              />
            </Box>
          ))}
          {inspectionWarningLettersData?.map((warningLetter) => (
            <Box
              key={warningLetter.id}
              onClick={() => openEnforcementWarningLetterDrawer(warningLetter)}
            >
              <EnforcementCard
                warningLetter={warningLetter}
                requirementEnforcements={requirementEnforcements}
              />
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default InspectionEnforcements;
