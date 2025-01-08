import { Box, DialogContent, Grid, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import ControlledRichTextEditor from "@/components/Shared/Controlled/ControlledRichTextEditor";
import { useDocumentTypesData } from "@/hooks/useInspectionRequirements";
import {
  RequirementRelatedDocumentFormData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import { RequirementDocumentType } from "@/models/RequirementDocumentType";
import { BCDesignTokens } from "epic.theme";
import {
  RequirementDocumentTypeEnum,
  RequirementSourceEnum,
} from "@/utils/constants";

type RequirementRelatedDocumentModalProps = {
  onSubmit: (data: RequirementRelatedDocumentFormData) => void;
  requirementSourceFormData: RequirementSourceFormData;
  relatedDocumentData?: RequirementRelatedDocumentFormData;
  isAddSection?: boolean;
};

const relatedDocumentFormSchema = yup.object().shape({
  relatedDocument: yup
    .object<RequirementDocumentType>()
    .nullable()
    .required("Related Document is required"),
  documentTitle: yup.string().nullable(),
  sectionNumber: yup.string().nullable(),
  sectionTitle: yup.string().nullable(),
  description: yup
    .object({
      html: yup.string().nullable(),
      text: yup.string().nullable(),
    })
    .nullable(),
});

type RequirementRelatedDocumentSchemaType = yup.InferType<
  typeof relatedDocumentFormSchema
>;

const initFormData: RequirementRelatedDocumentFormData = {
  relatedDocument: undefined,
  documentTitle: "",
  sectionNumber: "",
  sectionTitle: "",
  description: undefined,
};

const RequirementRelatedDocumentModal: React.FC<
  RequirementRelatedDocumentModalProps
> = ({
  onSubmit,
  relatedDocumentData,
  requirementSourceFormData,
  isAddSection,
}) => {
  const { data: documentTypeList } = useDocumentTypesData();

  const isScheduleB =
    requirementSourceFormData.requirementSource?.id ===
    RequirementSourceEnum.SCHEDULE_B;

  const defaultValues = useMemo<RequirementRelatedDocumentFormData>(() => {
    const defaultData = relatedDocumentData ?? initFormData;
    if (isAddSection) {
      return {
        ...defaultData,
        sectionNumber: "",
        sectionTitle: "",
        description: undefined,
      };
    }
    if (!isScheduleB) {
      return {
        ...defaultData,
        relatedDocument: documentTypeList?.find(
          (doc) => doc.id === RequirementDocumentTypeEnum.OTHER_DOCUMENT
        ), // auto select "Other Document" if not Schedule B
      };
    }
    return defaultData;
  }, [relatedDocumentData, isScheduleB, documentTypeList, isAddSection]);

  const methods = useForm<RequirementRelatedDocumentSchemaType>({
    resolver: yupResolver(relatedDocumentFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: RequirementRelatedDocumentSchemaType) => {
    const formData = data as RequirementRelatedDocumentFormData;
    formData.sourceFormId = requirementSourceFormData.id;
    if (!relatedDocumentData || isAddSection) {
      formData.id = Date.now();
    }
    onSubmit(formData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar
          title={
            relatedDocumentData
              ? isAddSection
                ? "Add Section"
                : "Edit Related Document"
              : "Add Related Document"
          }
        />
        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              mb: 2,
              p: "0.75rem",
              backgroundColor: BCDesignTokens.surfaceColorBackgroundLightBlue,
              borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
            }}
          >
            <Box width="40%" display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="caption" fontWeight={700}>
                Title:
              </Typography>
              <Typography variant="body2">
                {requirementSourceFormData.requirementSource?.name}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="caption" fontWeight={700}>
                Condition #:
              </Typography>
              <Typography variant="body2">
                {requirementSourceFormData.sourceNumber}
              </Typography>
            </Box>
          </Box>
          <ControlledAutoComplete
            name="relatedDocument"
            label="Related Document"
            options={documentTypeList ?? []}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!isScheduleB || isAddSection}
          />
          <ControlledTextField
            name="documentTitle"
            label="Document Title (optional)"
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <ControlledTextField
                name="sectionNumber"
                label="Section # (optional)"
                fullWidth
              />
            </Grid>
            <Grid item xs={9}>
              <ControlledTextField
                name="sectionTitle"
                label="Section Title (optional)"
                fullWidth
              />
            </Grid>
          </Grid>
          <ControlledRichTextEditor label="Description" name="description" />
        </DialogContent>
        <ModalActions
          primaryActionButtonText={
            relatedDocumentData ? (isAddSection ? "Add" : "Save") : "Add"
          }
        />
      </form>
    </FormProvider>
  );
};

export default RequirementRelatedDocumentModal;
