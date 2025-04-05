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
  formatRequirementBatchAPIData,
  formatRequirementFormData,
  formatRequirementImagesInFindings,
  RequirementFormSchema,
  updateImagesWithContinuousSortOrder,
} from "./RequirementUtils";
import * as yup from "yup";
import { useAgenciesData } from "@/hooks/useAgencies";
import { useRequirementStore } from "./requirementStore";
import { mergeMapsWithArrayConcat } from "@/utils/appUtils";

type RequirementDrawerProps = {
  inspectionData: Inspection;
  onSubmit: (submitMsg: string, isClose: boolean) => void;
  requirement?: InspectionRequirement;
  index?: number;
  isRegulatoryConsideration?: boolean;
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
  isRegulatoryConsideration = false,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const [inspectionRequirementData, setInspectionRequirementData] = useState<
    InspectionRequirementFormData | undefined
  >(undefined);
  const [requirementSourceList, setRequirementSourceList] = useState<
    RequirementSourceFormData[]
  >([]);
  const [isRequirementSourceListDirty, setIsRequirementSourceListDirty] =
    useState(false);

  const {
    requirementsList,
    requirementPhotos,
    requirementFigures,
    isDataChanged,
    isImageChanged,
    setIsDataChanged,
    setIsImageChanged,
    resetRequirementStoreFlags,
  } = useRequirementStore();

  const { data: inspectionRequirementTypesList } =
    useInspectionRequirementTypesData();
  const { data: enforcementActionsList } = useEnforcementActionsData();
  const { data: complianceFindingsList } = useComplianceFindingsData();
  const { data: topicsList } = useTopicsData();
  const { data: agenciesList } = useAgenciesData();

  const GeneratedFormSchema = RequirementFormSchema(isRegulatoryConsideration);

  type RequirementSchemaType = yup.InferType<typeof GeneratedFormSchema>;

  const methods = useForm<RequirementSchemaType>({
    resolver: yupResolver(GeneratedFormSchema),
    mode: "onBlur",
    defaultValues: requirement
      ? formatRequirementFormData(requirement)
      : {
          ...initFormData,
          requirementType: inspectionRequirementTypesList?.[0],
        },
  });

  const { handleSubmit, reset: resetForm } = methods;

  useEffect(() => {
    resetForm(
      inspectionRequirementData ?? {
        ...initFormData,
        requirementType: inspectionRequirementTypesList?.[0],
      }
    );
  }, [inspectionRequirementData, resetForm, inspectionRequirementTypesList]);

  const onCreateSuccess = useCallback(() => {
    onSubmit("Requirement created successfully!", true);
    resetForm();
  }, [onSubmit, resetForm]);

  const onUpdateSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!", false);
    setIsRequirementSourceListDirty(false);
    setIsImageChanged(false);
  }, [onSubmit, setIsImageChanged]);

  const onDeleteSuccess = useCallback(() => {
    onSubmit("Requirement deleted successfully!", true);
    resetForm();
  }, [onSubmit, resetForm]);

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
    resetRequirementStoreFlags();
  }, [requirement, formatAndSetFormData, resetRequirementStoreFlags]);

  useEffect(() => {
    if (isDataChanged) {
      setIsRequirementSourceListDirty(true);
    }
  }, [isDataChanged]);

  useEffect(() => {
    if (inspectionRequirementUpdateData) {
      formatAndSetFormData(inspectionRequirementUpdateData);
      setIsDataChanged(false);
    }
  }, [inspectionRequirementUpdateData, formatAndSetFormData, setIsDataChanged]);

  const { mutate: deleteInspectionRequirement } =
    useDeleteInspectionRequirement(onDeleteSuccess);

  const onDeleteRequirement = () => {
    if (!requirement) {
      return;
    }
    if (
      (requirementPhotos.get(requirement.id) ?? []).length > 0 ||
      (requirementFigures.get(requirement.id) ?? []).length > 0
    ) {
      // Remove the requirement's photos and figures from the records & update the sort order
      let updatedRequirementPhotos = new Map(requirementPhotos);
      let updatedRequirementFigures = new Map(requirementFigures);

      if (updatedRequirementPhotos.has(requirement.id)) {
        updatedRequirementPhotos.delete(requirement.id);
        updatedRequirementPhotos = updateImagesWithContinuousSortOrder(
          updatedRequirementPhotos
        );
      }
      if (updatedRequirementFigures.has(requirement.id)) {
        updatedRequirementFigures.delete(requirement.id);
        updatedRequirementFigures = updateImagesWithContinuousSortOrder(
          updatedRequirementFigures
        );
      }

      // Combine the photos and figures into a single map list
      const requirementImages = mergeMapsWithArrayConcat(
        updatedRequirementPhotos,
        updatedRequirementFigures
      );

      // update the requirement images sort order in all findings
      const updatedRequirementsList = formatRequirementImagesInFindings(
        requirementsList,
        requirementImages
      );

      // prepare for batch update
      const requirementBatchAPIData = formatRequirementBatchAPIData(
        updatedRequirementsList,
        updatedRequirementPhotos,
        updatedRequirementFigures,
        requirement?.id ?? 0
      );

      deleteInspectionRequirement({
        inspectionId: inspectionData.id,
        requirementId: requirement.id,
        requirementBatch: requirementBatchAPIData,
      });
    } else {
      deleteInspectionRequirement({
        inspectionId: inspectionData.id,
        requirementId: requirement.id,
      });
    }
  };

  const onSubmitHandler = useCallback(
    (formData: RequirementSchemaType) => {
      const formLeftData = formData as InspectionRequirementFormData;

      const inspectionRequirementPayload = isRegulatoryConsideration
        ? formatRegulatoryConsiderationAPIData(formLeftData)
        : formatRequirementAPIData(
            formLeftData,
            requirementSourceList,
            requirementPhotos.get(requirement?.id ?? NaN),
            requirementFigures.get(requirement?.id ?? NaN)
          );

      if (inspectionRequirementData) {
        // prepare for batch update
        const requirementBatchAPIData = isImageChanged
          ? formatRequirementBatchAPIData(
              requirementsList,
              requirementPhotos,
              requirementFigures,
              requirement?.id ?? 0
            )
          : undefined;
        updateInspectionRequirement({
          inspectionId: inspectionData.id,
          requirementId: inspectionRequirementData.id ?? 0,
          inspectionRequirement: inspectionRequirementPayload,
          requirementBatch: requirementBatchAPIData,
        });
      } else {
        createInspectionRequirement({
          inspectionId: inspectionData.id,
          inspectionRequirement: inspectionRequirementPayload,
        });
      }
    },
    [
      requirementsList,
      requirementPhotos,
      requirementFigures,
      requirement,
      isRegulatoryConsideration,
      requirementSourceList,
      inspectionRequirementData,
      updateInspectionRequirement,
      inspectionData,
      createInspectionRequirement,
      isImageChanged,
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
      return isRegulatoryConsideration
        ? `Edit Regulatory Consideration`
        : `Edit Requirement ${index !== undefined ? `#${index + 1}` : ""}`;
    }
    return isRegulatoryConsideration
      ? "Create Regulatory Consideration"
      : "Create Requirement";
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
            complianceFindingsList={complianceFindingsList ?? []}
            enforcementActionsList={enforcementActionsList ?? []}
            topicList={topicsList ?? []}
            agencyList={agenciesList ?? []}
            appHeaderHeight={appHeaderHeight}
            isRegulatoryConsideration={isRegulatoryConsideration}
            isEditMode={!!inspectionRequirementData}
            requirementId={requirement?.id ?? 0}
          />
          <RequirementFormRight
            onDataChange={onRequirementSourceListDataChange}
            requirementSourceFormDataList={requirementSourceList}
            inspectionId={inspectionData.id}
            isRegulatoryConsideration={isRegulatoryConsideration}
            requirementId={requirement?.id ?? 0}
          />
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
