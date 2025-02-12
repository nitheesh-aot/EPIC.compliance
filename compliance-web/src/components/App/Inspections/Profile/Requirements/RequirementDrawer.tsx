import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import DrawerActionBarTop from "@/components/Shared/Drawer/DrawerActionBarTop";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import {
  useComplianceFindingsData,
  useCreateInspectionRequirement,
  useDeleteInspectionRequirement,
  useEnforcementActionsData,
  useInspectionRequirementTypesData,
  useUpdateInspectionRequirement,
} from "@/hooks/useInspectionRequirements";
import { useTopicsData } from "@/hooks/useTopics";
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
  formatRegulatoryConsiderationAPIData,
  formatRequirementAPIData,
  formatRequirementFormData,
  REQUIREMENT_TYPE_ID,
  RequirementFormSchema,
  RequirementSchemaType,
} from "./RequirementUtils";
import { useAgenciesData } from "@/hooks/useAgencies";
import { InspectionRequirementType } from "@/models/InspectionRequirementType";

type RequirementDrawerProps = {
  inspectionData: Inspection;
  onSubmit: (submitMsg: string, isClose: boolean) => void;
  requirement?: InspectionRequirement;
  index?: number;
  isRegulatoryConsiderationExists?: boolean;
};

const initFormData: InspectionRequirementFormData = {
  requirementType: undefined,
  requirementSummary: "",
  topic: undefined,
  complianceFinding: undefined,
  enforcementAction: undefined,
  findings: undefined,
};

const RequirementDrawer: React.FC<RequirementDrawerProps> = ({
  inspectionData,
  onSubmit,
  requirement,
  index,
  isRegulatoryConsiderationExists,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const [inspectionRequirementData, setInspectionRequirementData] = useState<
    InspectionRequirementFormData | undefined
  >(undefined);
  const [requirementSourceList, setRequirementSourceList] = useState<
    RequirementSourceFormData[]
  >([]);
  const [selectedRequirementType, setSelectedRequirementType] = useState<
    InspectionRequirementType | undefined
  >(undefined);
  const [isRequirementSourceListDirty, setIsRequirementSourceListDirty] =
    useState(false);

  const { data: inspectionRequirementTypesList } =
    useInspectionRequirementTypesData();
  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();
  const { data: agenciesList } = useAgenciesData();

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(RequirementFormSchema),
    mode: "onBlur",
    defaultValues: requirement
      ? formatRequirementFormData(requirement)
      : {
          ...initFormData,
          requirementType: inspectionRequirementTypesList?.[0],
        },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(
      inspectionRequirementData ?? {
        ...initFormData,
        requirementType: inspectionRequirementTypesList?.[0],
      }
    );
  }, [inspectionRequirementData, reset, inspectionRequirementTypesList]);

  const onCreateSuccess = useCallback(() => {
    onSubmit("Requirement created successfully!", true);
    reset();
  }, [onSubmit, reset]);

  const onUpdateSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!", false);
    setIsRequirementSourceListDirty(false);
  }, [onSubmit]);

  const onDeleteSuccess = useCallback(() => {
    onSubmit("Requirement deleted successfully!", true);
    reset();
  }, [onSubmit, reset]);

  const { mutate: createInspectionRequirement } =
    useCreateInspectionRequirement(onCreateSuccess);

  const {
    mutate: updateInspectionRequirement,
    data: inspectionRequirementUpdateData,
  } = useUpdateInspectionRequirement(onUpdateSuccess);

  const formatAndSetFormData = useCallback(
    (inspectionRequirement: InspectionRequirement) => {
      const inspectionRequirementFormData = formatRequirementFormData(
        inspectionRequirement
      );
      setInspectionRequirementData(inspectionRequirementFormData);
      setRequirementSourceList(
        inspectionRequirementFormData.requirementSourceDetails ?? []
      );
    },
    []
  );

  useEffect(() => {
    if (requirement) {
      formatAndSetFormData(requirement);
    }
  }, [requirement, formatAndSetFormData]);

  useEffect(() => {
    if (inspectionRequirementUpdateData) {
      formatAndSetFormData(inspectionRequirementUpdateData);
    }
  }, [inspectionRequirementUpdateData, formatAndSetFormData]);

  const isRequirement = selectedRequirementType?.id === REQUIREMENT_TYPE_ID;

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

      const inspectionRequirementPayload = isRequirement
        ? formatRequirementAPIData(formLeftData, requirementSourceList)
        : formatRegulatoryConsiderationAPIData(formLeftData);

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
      isRequirement,
      requirementSourceList,
      inspectionRequirementData,
      updateInspectionRequirement,
      inspectionData.id,
      createInspectionRequirement,
    ]
  );

  const onRequirementSourceListDataChange = (
    data: RequirementSourceFormData[]
  ) => {
    const isDifferent =
      JSON.stringify(data) !== JSON.stringify(requirementSourceList);
    if (isDifferent) {
      setIsRequirementSourceListDirty(true);
      setRequirementSourceList(data);
    }
  };

  const getDrawerTitle = () => {
    if (inspectionRequirementData) {
      return isRequirement
        ? `Edit Requirement ${index !== undefined ? `#${index + 1}` : ""}`
        : `Edit Regulatory Consideration`;
    }
    return isRequirement
      ? "Create Requirement"
      : "Create Regulatory Consideration";
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={getDrawerTitle()}
          isFormDirtyCheck
          isDirtyManual={isRequirementSourceListDirty}
        />
        <DrawerActionBarTop isShowActionBar={!inspectionRequirementData} />
        <Stack
          key={JSON.stringify(inspectionRequirementData)}
          height={`calc(100vh - ${appHeaderHeight + 129}px)`} // 64px (DrawerTitleBar height) + 65px (DrawerActionBar height)
          direction={"row"}
        >
          <RequirementFormLeft
            inspectionRequirementTypesList={
              inspectionRequirementTypesList ?? []
            }
            complianceFindingsList={complianceFindingsList ?? []}
            enforcementActionsList={enforcementActionsList ?? []}
            topicList={topicsList ?? []}
            agencyList={agenciesList ?? []}
            appHeaderHeight={appHeaderHeight}
            onRequirementTypeChange={(requirementType) => {
              setSelectedRequirementType(requirementType ?? undefined);
            }}
            isRegulatoryConsiderationExists={isRegulatoryConsiderationExists}
            isEditMode={!!inspectionRequirementData}
          />
          {isRequirement && (
            <RequirementFormRight
              onDataChange={onRequirementSourceListDataChange}
              requirementSourceFormDataList={requirementSourceList}
            />
          )}
        </Stack>
        <DrawerActionBarBottom
          isShowActionBar={!!inspectionRequirementData}
          onDeleteAction={onDeleteRequirement}
          onDeleteTitle="Delete Requirement"
          onDeleteDescription="You are about to delete this Requirement. Are you sure?"
          isDirtyManual={isRequirementSourceListDirty}
        />
      </form>
    </FormProvider>
  );
};

export default RequirementDrawer;
