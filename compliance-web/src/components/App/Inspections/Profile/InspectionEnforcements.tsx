import { useInspectionRequirementsData } from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { Box, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import RequirementLoading from "./Requirements/RequirementLoading";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import EnforcementNotificationCard from "./Enforcements/EnforcementNotificationCard";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { DRAWER_WIDTHS, EnforcementActionEnum } from "@/utils/constants";
import { useModal } from "@/store/modalStore";
import EnforcementModal from "./Enforcements/EnforcementModal";
import { notify } from "@/store/snackbarStore";
import EnforcementCard from "./Enforcements/EnforcementCard";
import { useInspectionOrdersData } from "@/hooks/useInspectionOrders";
import EnforcementOrderDrawer from "./Enforcements/Orders/EnforcementOrderDrawer";
import { InspectionOrder } from "@/models/InspectionOrder";
import { useDrawer } from "@/store/drawerStore";
import { useInspectionWarningLettersData } from "@/hooks/useInspectionWarningLetters";
import EnforcementWarningLetterDrawer from "./Enforcements/WarningLetters/EnforcementWarningLetterDrawer";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import { AddRounded } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";

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

  const prepNonProceededRequirements = useCallback(
    (
      orderReqIds: (number[] | undefined)[] | undefined,
      enforcementAction: EnforcementActionEnum
    ) => {
      const flattenedOrderReqIds = orderReqIds?.flat() || [];
      const nonProceededRequirements = requirementEnforcements.filter(
        (requirement) =>
          !flattenedOrderReqIds.includes(requirement.id) &&
          requirement.enforcement_action_data?.some(
            (enforcement) => enforcement.id === enforcementAction
          )
      );
      return nonProceededRequirements;
    },
    [requirementEnforcements]
  );

  const nonProceededOrderRequirements = useMemo(() => {
    if (!requirementEnforcements) return [];
    const orderReqIds = inspectionOrdersData?.map((order) =>
      order.order_requirement_maps?.map((map) => map.inspection_requirement_id)
    );
    return prepNonProceededRequirements(
      orderReqIds,
      EnforcementActionEnum.ORDER
    );
  }, [
    requirementEnforcements,
    inspectionOrdersData,
    prepNonProceededRequirements,
  ]);

  const nonProceededWarningLetterRequirements = useMemo(() => {
    if (!requirementEnforcements) return [];
    const warningLetterReqIds = inspectionWarningLettersData?.map(
      (warningLetter) =>
        warningLetter.warning_letter_requirement_maps?.map(
          (map) => map.inspection_requirement_id
        )
    );
    return prepNonProceededRequirements(
      warningLetterReqIds,
      EnforcementActionEnum.WARNING_LETTER
    );
  }, [
    requirementEnforcements,
    inspectionWarningLettersData,
    prepNonProceededRequirements,
  ]);

  const openEnforcementModal = (
    modelType: EnforcementActionEnum,
    requirement?: InspectionRequirement
  ) => {
    setModalOpen({
      content: (
        <EnforcementModal
          inspectionData={inspectionData}
          enforcementType={modelType}
          requirementsList={
            modelType === EnforcementActionEnum.ORDER
              ? nonProceededOrderRequirements
              : nonProceededWarningLetterRequirements
          }
          requirement={requirement}
          onSubmit={(message, data) => {
            notify.success(message);
            if (modelType === EnforcementActionEnum.ORDER) {
              refetchInspectionOrders();
              openEnforcementOrderDrawer(data as InspectionOrder);
            } else {
              refetchInspectionWarningLetters();
              openEnforcementWarningLetterDrawer(
                data as InspectionWarningLetter
              );
            }
            setModalClose();
          }}
        />
      ),
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
        <EnforcementOrderDrawer
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
        <EnforcementWarningLetterDrawer
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
