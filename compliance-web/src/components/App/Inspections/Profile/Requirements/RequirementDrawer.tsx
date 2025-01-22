import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useMemo, useState } from "react";
import { useMenuStore } from "@/store/menuStore";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import RequirementFormLeft from "./RequirementFormLeft";
import { useTopicsData } from "@/hooks/useTopics";
import {
  InspectionRequirement,
  InspectionRequirementFormData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import { Inspection } from "@/models/Inspection";
import { EnforcementAction } from "@/models/EnforcementAction";
import {
  useComplianceFindingsData,
  useCreateInspectionRequirement,
  useDeleteInspectionRequirement,
  useEnforcementActionsData,
  useUpdateInspectionRequirement,
} from "@/hooks/useInspectionRequirements";
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
  const [requirementSourceList, setRequirementSourceList] = useState<
    RequirementSourceFormData[]
  >([]);

  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();

  const defaultValues = useMemo<InspectionRequirementFormData>(() => {
    return requirement ? formatRequirementFormData(requirement) : initFormData;
  }, [requirement]);

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(RequirementFormSchema),
    mode: "onBlur",
    defaultValues: defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!");
    reset();
  }, [onSubmit, reset]);

  const onDeleteSuccess = useCallback(() => {
    onSubmit("Requirement deleted successfully!");
    reset();
  }, [onSubmit, reset]);

  const { mutate: createInspectionRequirement } =
    useCreateInspectionRequirement(onSuccess);
  const { mutate: updateInspectionRequirement } =
    useUpdateInspectionRequirement(onSuccess);

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

      if (requirement) {
        updateInspectionRequirement({
          inspectionId: inspectionData.id,
          requirementId: requirement.id,
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
      requirement,
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
            requirement
              ? `Edit Requirement ${index !== undefined ? `#${index + 1}` : ""}`
              : "Create Requirement"
          }
          isFormDirtyCheck
        />
        <DrawerActionBarTop isShowActionBar={!requirement} />
        <Stack
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
            requirementSourceFormDataList={
              defaultValues.requirementSourceDetails ?? []
            }
          />
        </Stack>
        <DrawerActionBarBottom
          isShowActionBar={!!requirement}
          onDeleteAction={onDeleteRequirement}
          onDeleteTitle="Delete Requirement"
          onDeleteDescription="You are about to delete this Requirement. Are you sure?"
        />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
