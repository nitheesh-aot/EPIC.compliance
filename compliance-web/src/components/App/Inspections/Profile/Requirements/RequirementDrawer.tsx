import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback } from "react";
import { useMenuStore } from "@/store/menuStore";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import RequirementFormLeft from "./RequirementFormLeft";
import * as yup from "yup";
import { useTopicsData } from "@/hooks/useTopics";
import { Topic } from "@/models/Topic";
import { IRType } from "@/models/IRType";
import { IRStatus } from "@/models/IRStatus";
import { InspectionRequirementFormData } from "@/models/InspectionRequirement";
import { useComplianceFindingsData, useEnforcementActionsData } from "@/hooks/useInspectionRequirements";

type RequirementDrawerProps = {
  onSubmit: (submitMsg: string) => void;
};

const RequirementFormSchema = yup.object().shape({
  requirementSummary: yup.string().nullable(),
  topic: yup.object<Topic>().nullable().required("Primary is required"),
  complianceFinding: yup
    .object<IRType>()
    .nullable()
    .required("Primary is required"),
  enforcementAction: yup
    .array()
    .of(yup.object<IRStatus>())
    .min(1, "At least one Type is required")
    .required("Type is required"),
  findings: yup
    .object({
      html: yup.string().required("Entry is required"),
      text: yup.string().required("Entry is required"),
    })
    .nullable(),
});

export type RequirementSchemaType = yup.InferType<typeof RequirementFormSchema>;

const initFormData: InspectionRequirementFormData = {
  requirementSummary: "",
  topic: undefined,
  complianceFinding: undefined,
  enforcementAction: [] as IRStatus[],
  findings: undefined,
};

const RequirementDrawer: React.FC<RequirementDrawerProps> = ({ onSubmit }) => {
  const { appHeaderHeight } = useMenuStore();

  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(RequirementFormSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit } = methods;

  // const onSuccess = useCallback(
  //   (data: Inspection) => {
  //     // eslint-disable-next-line no-console
  //     console.log("data", data);
  //     onSubmit("Changes saved successfully!");
  //     reset();
  //   },
  //   [onSubmit, reset]
  // );

  // const { mutate: createInspection } = useCreateInspection(onSuccess);
  // const { mutate: updateInspection } = useUpdateInspection(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: RequirementSchemaType) => {
      // eslint-disable-next-line no-console
      console.log("formData", formData);
      onSubmit("Changes saved successfully!");
    },
    [onSubmit]
  );

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
        </Stack>
        <DrawerActionBarBottom isShowActionBar={false} />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
