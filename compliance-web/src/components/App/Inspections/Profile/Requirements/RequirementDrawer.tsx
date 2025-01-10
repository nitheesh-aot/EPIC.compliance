import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { useCallback, useState } from "react";
import { useMenuStore } from "@/store/menuStore";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import RequirementFormLeft from "./RequirementFormLeft";
import * as yup from "yup";
import { useTopicsData } from "@/hooks/useTopics";
import { Topic } from "@/models/Topic";
import { IRType } from "@/models/IRType";
import { IRStatus } from "@/models/IRStatus";
import {
  InspectionRequirementAPIData,
  InspectionRequirementFormData,
  InspectionRequirementSourceAPIData,
  InspectionRequirementSourceDocumentAPIData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import {
  useComplianceFindingsData,
  useCreateInspectionRequirement,
  useEnforcementActionsData,
} from "@/hooks/useInspectionRequirements";
import RequirementFormRight from "./RequirementFormRight";
import { Inspection } from "@/models/Inspection";
import { RequirementSourceEnum } from "@/utils/constants";

type RequirementDrawerProps = {
  inspectionData: Inspection;
  onSubmit: (submitMsg: string) => void;
};

const RequirementFormSchema = yup.object().shape({
  requirementSummary: yup.string().nullable(),
  topic: yup.object<Topic>().nullable().required("Topic is required"),
  complianceFinding: yup.object<IRType>().nullable(),
  enforcementAction: yup.array().of(yup.object<IRStatus>()).nullable(),
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

  const onSuccess = useCallback(
    (data: InspectionRequirementAPIData) => {
      // eslint-disable-next-line no-console
      console.log("data", data);
      onSubmit("Changes saved successfully!");
      reset();
    },
    [onSubmit, reset]
  );

  const { mutate: createInspectionRequirement } =
    useCreateInspectionRequirement(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: RequirementSchemaType) => {
      // eslint-disable-next-line no-console
      console.log("formData", formData, requirementSourceList);
      const formLeftData = formData as InspectionRequirementFormData;
      const requirementSourceDetails: InspectionRequirementSourceAPIData[] =
        requirementSourceList.map((item) => {
          const requirementSource: InspectionRequirementSourceAPIData = {
            requirement_source_id: item.requirementSource?.id ?? "",
            amendment_number: item.sourceAmendmentNumber ?? "",
            title: item.sourceTitle ?? "",
            description: item.description?.html ?? "",
            documents: [],
          };
          if (
            [
              RequirementSourceEnum.SCHEDULE_B,
              RequirementSourceEnum.EAC,
              RequirementSourceEnum.EACA,
            ].includes(item.requirementSource?.id as RequirementSourceEnum)
          ) {
            requirementSource.condition_number = item.sourceNumber ?? "";
          } else {
            requirementSource.section_number = item.sourceNumber ?? "";
          }
          item.relatedDocuments?.forEach((document) => {
            document.sections?.forEach((section) => {
              const srcDocument: InspectionRequirementSourceDocumentAPIData = {
                document_type_id: document.relatedDocument?.id ?? "",
                document_title: document.documentTitle ?? "",
                section_number: section.sectionNumber ?? "",
                section_title: section.sectionTitle ?? "",
              };
              requirementSource.documents.push(srcDocument);
            });
          });
          return requirementSource;
        });
      const inspectionRequirementPayload: InspectionRequirementAPIData = {
        inspection_id: inspectionData.id,
        summary: formLeftData.requirementSummary ?? "",
        topic_id: formLeftData.topic?.id ?? 0,
        enforcement_action_id: formLeftData.enforcementAction?.[0]?.id ?? "",
        compliance_finding_id: formLeftData.complianceFinding?.id ?? "",
        findings: formLeftData.findings?.html ?? "",
        sort_order: 0,
        requirement_source_details: requirementSourceDetails,
      };

      // eslint-disable-next-line no-console
      console.log("inspectionRequirementPayload", inspectionRequirementPayload);

      createInspectionRequirement(inspectionRequirementPayload);
    },
    [createInspectionRequirement, requirementSourceList, inspectionData]
  );

  const onDataChange = (data: RequirementSourceFormData[]) => {
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
          <RequirementFormRight onDataChange={onDataChange} />
        </Stack>
        <DrawerActionBarBottom isShowActionBar={false} />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
