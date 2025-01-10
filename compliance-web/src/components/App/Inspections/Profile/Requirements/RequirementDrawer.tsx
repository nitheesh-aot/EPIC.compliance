import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useState } from "react";
import { useMenuStore } from "@/store/menuStore";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import RequirementFormLeft from "./RequirementFormLeft";
import { useTopicsData } from "@/hooks/useTopics";
import {
  InspectionRequirementFormData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import { Inspection } from "@/models/Inspection";
import { EnforcementAction } from "@/models/EnforcementAction";
import {
  useComplianceFindingsData,
  useCreateInspectionRequirement,
  useEnforcementActionsData,
} from "@/hooks/useInspectionRequirements";
import RequirementFormRight from "./RequirementFormRight";
import {
  formatRequirementAPIData,
  RequirementFormSchema,
  RequirementSchemaType,
} from "./RequirementUtils";

type RequirementDrawerProps = {
  inspectionData: Inspection;
  onSubmit: (submitMsg: string) => void;
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
}) => {
  const { appHeaderHeight } = useMenuStore();
  const [requirementSourceList, setRequirementSourceList] = useState<
    RequirementSourceFormData[]
  >([]);

  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(RequirementFormSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!");
    reset();
  }, [onSubmit, reset]);

  const { mutate: createInspectionRequirement } =
    useCreateInspectionRequirement(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: RequirementSchemaType) => {
      const formLeftData = formData as InspectionRequirementFormData;
      const inspectionRequirementPayload = formatRequirementAPIData(
        inspectionData.id,
        formLeftData,
        requirementSourceList
      );

      createInspectionRequirement(inspectionRequirementPayload);
    },
    [createInspectionRequirement, requirementSourceList, inspectionData]
  );

  const onRequirementSourceListDataChange = (data: RequirementSourceFormData[]) => {
    setRequirementSourceList(data);
    return data;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar title={"Create Requirement"} isFormDirtyCheck />
        <DrawerActionBarTop isShowActionBar={true} />
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
          <RequirementFormRight onDataChange={onRequirementSourceListDataChange} />
        </Stack>
        <DrawerActionBarBottom isShowActionBar={false} />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
