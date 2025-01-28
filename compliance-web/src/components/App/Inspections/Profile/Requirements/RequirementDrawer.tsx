import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import {
  useComplianceFindingsData,
  useCreateInspectionRequirement,
  useDeleteInspectionRequirement,
  useEnforcementActionsData,
  useUpdateInspectionRequirement,
} from "@/hooks/useInspectionRequirements";
import { useTopicsData } from "@/hooks/useTopics";
import { EnforcementAction } from "@/models/EnforcementAction";
import { Inspection } from "@/models/Inspection";
import {
  InspectionRequirement,
  InspectionRequirementFormData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import { useMenuStore } from "@/store/menuStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequirementFormLeft from "./RequirementFormLeft";
import RequirementFormRight from "./RequirementFormRight";
import {
  formatRequirementAPIData,
  formatRequirementFormData,
  RequirementFormSchema,
  RequirementSchemaType,
} from "./RequirementUtils";

type RequirementDrawerProps = {
  inspectionData: Inspection;
  onSubmit: (submitMsg: string) => void;
  requirement?: InspectionRequirement;
  index?: number;
};

const initFormData: InspectionRequirementFormData = {
  requirementSummary: "",
  topic: undefined,
  complianceFinding: undefined,
  enforcementAction: [] as EnforcementAction[],
  findings: undefined,
};

const RequirementDrawer: React.FC<RequirementDrawerProps> = ({
  inspectionData,
  onSubmit,
  requirement,
  index,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const [inspectionRequirementData, setInspectionRequirementData] = useState<
    InspectionRequirementFormData | undefined
  >(undefined);
  const [requirementSourceList, setRequirementSourceList] = useState<
    RequirementSourceFormData[]
  >([]);

  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(RequirementFormSchema),
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(inspectionRequirementData ?? initFormData);
  }, [inspectionRequirementData, reset]);

  const onSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!");
  }, [onSubmit]);

  const onDeleteSuccess = useCallback(() => {
    onSubmit("Requirement deleted successfully!");
    reset();
  }, [onSubmit, reset]);

  const {
    mutate: createInspectionRequirement,
    data: inspectionRequirementCreateData,
  } = useCreateInspectionRequirement(onSuccess);
  const {
    mutate: updateInspectionRequirement,
    data: inspectionRequirementUpdateData,
  } = useUpdateInspectionRequirement(onSuccess);

  useEffect(() => {
    const inspectionRequirement: InspectionRequirement =
      inspectionRequirementUpdateData ??
      inspectionRequirementCreateData ??
      requirement;
    if (inspectionRequirement) {
      const inspectionRequirementFormData = formatRequirementFormData(
        inspectionRequirement
      );
      setInspectionRequirementData(inspectionRequirementFormData);
      setRequirementSourceList(
        inspectionRequirementFormData.requirementSourceDetails ?? []
      );
    }
  }, [
    inspectionRequirementUpdateData,
    inspectionRequirementCreateData,
    requirement,
  ]);

  const { mutate: deleteInspectionRequirement } =
    useDeleteInspectionRequirement(onDeleteSuccess);

  const onDeleteRequirement = () => {
    if (requirement) {
      deleteInspectionRequirement({
        inspectionId: inspectionData.id,
        requirementId: requirement.id,
      });
    }
  };

  const onSubmitHandler = useCallback(
    (formData: RequirementSchemaType) => {
      const formLeftData = formData as InspectionRequirementFormData;
      const inspectionRequirementPayload = formatRequirementAPIData(
        formLeftData,
        requirementSourceList
      );

      if (inspectionRequirementData) {
        updateInspectionRequirement({
          inspectionId: inspectionData.id,
          requirementId: inspectionRequirementData.id ?? 0,
          inspectionRequirement: inspectionRequirementPayload,
        });
      } else {
        createInspectionRequirement({
          inspectionId: inspectionData.id,
          inspectionRequirement: inspectionRequirementPayload,
        });
      }
    },
    [
      inspectionData,
      requirementSourceList,
      inspectionRequirementData,
      updateInspectionRequirement,
      createInspectionRequirement,
    ]
  );

  const onRequirementSourceListDataChange = (
    data: RequirementSourceFormData[]
  ) => {
    setRequirementSourceList(data);
    return data;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={
            inspectionRequirementData
              ? `Edit Requirement ${index !== undefined ? `#${index + 1}` : ""}`
              : "Create Requirement"
          }
          isFormDirtyCheck
        />
        <DrawerActionBarTop isShowActionBar={!inspectionRequirementData} />
        <Stack
          key={JSON.stringify(inspectionRequirementData)}
          height={`calc(100vh - ${appHeaderHeight + 129}px)`} // 64px (DrawerTitleBar height) + 65px (DrawerActionBar height)
          direction={"row"}
        >
          <RequirementFormLeft
            complianceFindingsList={complianceFindingsList ?? []}
            enforcementActionsList={enforcementActionsList ?? []}
            topicList={topicsList ?? []}
            appHeaderHeight={appHeaderHeight}
          />
          <RequirementFormRight
            onDataChange={onRequirementSourceListDataChange}
            requirementSourceFormDataList={requirementSourceList}
          />
        </Stack>
        <DrawerActionBarBottom
          isShowActionBar={!!inspectionRequirementData}
          onDeleteAction={onDeleteRequirement}
          onDeleteTitle="Delete Requirement"
          onDeleteDescription="You are about to delete this Requirement. Are you sure?"
          dirtyCheck={false}
        />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
