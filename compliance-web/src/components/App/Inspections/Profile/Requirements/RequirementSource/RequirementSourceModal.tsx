import { DialogContent, Stack } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import * as yup from "yup";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { RequirementSource } from "@/models/RequirementSource";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useRequirementSourcesData } from "@/hooks/useComplaints";
import { RequirementSourceEnum } from "@/utils/constants";
import { isRequirementSourceCondition } from "../RequirementUtils";
import ControlledLexicalEditor from "@/components/Shared/Controlled/ControlledLexicalEditor";
import { Appendix } from "@/models/Appendix";
import { InspectionOrder } from "@/models/InspectionOrder";
import { useInspectionOrdersProjectwiseData } from "@/hooks/useInspectionOrders";
import { CaseFile } from "@/models/CaseFile";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";

type RequirementSourceModalProps = {
  onSubmit: (data: RequirementSourceFormData) => void;
  caseFile: CaseFile;
  requirementSourceFormData?: RequirementSourceFormData;
  requirementSource?: RequirementSource;
  order?: InspectionOrder;
  appendixList?: Appendix[];
};

const requirementSourceFormSchema = yup.object().shape({
  requirementSource: yup
    .object<RequirementSource>()
    .nullable()
    .required("Requirement Source is required"),
  requirementSourceTitle: yup.string().nullable(),
  regulationNumber: yup.string().nullable(),
  exemptionOrderNumber: yup.string().nullable(),
  complianceNumber: yup.string().nullable(),
  amendmentNumber: yup.string().nullable(),
  appendix: yup.object<Appendix>().nullable(),
  sourceTitle: yup.string().nullable(),
  sourceAmendmentNumber: yup.string().nullable(),
  order: yup
    .object<InspectionOrder>()
    .nullable()
    .when("requirementSource", {
      is: (source: RequirementSource) =>
        source?.id === RequirementSourceEnum.ORDER,
      then: (schema) => schema.required("Order is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  description: yup
    .object({
      html: yup.string().required("Description is required"),
      text: yup.string().required("Description is required"),
    })
    .nullable()
    .required("Description is required"),
});

type RequirementSourceSchemaType = yup.InferType<
  typeof requirementSourceFormSchema
>;

const initFormData: RequirementSourceFormData = {
  requirementSource: undefined,
  requirementSourceTitle: "",
  appendix: undefined,
  sourceNumber: "",
  sourceTitle: "",
  sourceAmendmentNumber: "",
  description: undefined,
};

const RequirementSourceModal: React.FC<RequirementSourceModalProps> = ({
  onSubmit,
  caseFile,
  requirementSourceFormData,
  requirementSource,
  order,
  appendixList,
}) => {
  const { data: requirementSourceList } = useRequirementSourcesData();
  const { data: orderList } = useInspectionOrdersProjectwiseData(caseFile.id);
  const { data: caseFileData } = useCaseFileByNumber(caseFile.case_file_number);

  const defaultValues = useMemo<RequirementSourceFormData>(() => {
    return (
      requirementSourceFormData ?? {
        ...initFormData,
        requirementSource: requirementSource ?? undefined,
        order: order ?? undefined,
      }
    );
  }, [requirementSourceFormData, requirementSource, order]);

  const methods = useForm<RequirementSourceSchemaType>({
    resolver: yupResolver(requirementSourceFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset, control, getValues, setValue } = methods;
  const hasUserEditedTitle = useRef(false);
  const currentRequirementSourceId = useRef<string | null>(null);

  const selectedRequirementSource = useWatch({
    control,
    name: "requirementSource",
    defaultValue: getValues("requirementSource") ?? undefined,
  }) as RequirementSource;

  const selectedOrder = useWatch({
    control,
    name: "order",
    defaultValue: getValues("order") ?? undefined,
  }) as InspectionOrder;

  useEffect(() => {
    if (!requirementSourceFormData && selectedOrder?.now_therefore) {
      const newValue = {
        html: selectedOrder.now_therefore,
        text: selectedOrder.now_therefore,
      };
      setValue("description", newValue);
    }
  }, [selectedOrder, setValue, requirementSourceFormData]);

  useEffect(() => {
    reset(defaultValues);
    // Reset the user edit flag when form is reset
    hasUserEditedTitle.current = false;
    currentRequirementSourceId.current = null;
  }, [defaultValues, reset]);

  useEffect(() => {
    if (selectedRequirementSource) {
      // Check if requirement source has changed
      const hasSourceChanged =
        currentRequirementSourceId.current !== selectedRequirementSource.id;

      if (hasSourceChanged) {
        // Reset the edit flag when source changes
        hasUserEditedTitle.current = false;
        currentRequirementSourceId.current = selectedRequirementSource.id;

        let sourceTitle = selectedRequirementSource.source_title;
        if (sourceTitle && sourceTitle.includes("${eac#}")) {
          sourceTitle = sourceTitle.replace(
            "${eac#}",
            caseFileData?.authorization ?? ""
          );
        }
        setValue("requirementSourceTitle", sourceTitle);
      }
    }
  }, [selectedRequirementSource, setValue, caseFileData]);

  const onSubmitHandler = (data: RequirementSourceSchemaType) => {
    const formData = data as RequirementSourceFormData;
    if (!requirementSourceFormData) {
      formData.id = Date.now();
    }
    onSubmit(formData);
  };

  const handleTitleChange = () => {
    hasUserEditedTitle.current = true;
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalTitleBar
            title={
              requirementSourceFormData
                ? "Edit Requirement Source"
                : "Add Requirement Source"
            }
          />
          <DialogContent dividers>
            <ControlledAutoComplete
              name="requirementSource"
              label="Requirement Source"
              options={requirementSourceList ?? []}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={!!requirementSourceFormData || !!requirementSource}
              isRequired={true}
            />
            {selectedRequirementSource && (
              <Stack direction={"row"} gap={2}>
                <ControlledTextField
                  name="requirementSourceTitle"
                  label="Source Title"
                  fullWidth
                  onChange={handleTitleChange}
                />
                {selectedRequirementSource?.id ===
                  RequirementSourceEnum.REGULATION && (
                  <ControlledTextField
                    name="regulationNumber"
                    label="Regulation #"
                    fullWidth
                  />
                )}
                {selectedRequirementSource?.id ===
                  RequirementSourceEnum.EXEMPTION_ORDER && (
                  <ControlledTextField
                    name="exemptionOrderNumber"
                    label="Exemption Order #"
                    fullWidth
                  />
                )}
                {selectedRequirementSource?.id ===
                  RequirementSourceEnum.COMPLAINCE_AGREEMENT && (
                  <ControlledTextField
                    name="complianceNumber"
                    label="#"
                    fullWidth
                  />
                )}
                {selectedRequirementSource?.id ===
                  RequirementSourceEnum.EACA && (
                  <ControlledTextField
                    name="amendmentNumber"
                    label="Amendment #"
                    fullWidth
                  />
                )}
              </Stack>
            )}
            {selectedRequirementSource?.id === RequirementSourceEnum.ORDER && (
              <ControlledAutoComplete
                name="order"
                label="Order Number"
                options={orderList ?? []}
                getOptionLabel={(option) => option.order_number ?? ""}
                getOptionKey={(option) => option.id ?? ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={!!requirementSourceFormData || !!order}
                isRequired={true}
              />
            )}
            <ControlledAutoComplete
              name="appendix"
              label="Inspection Record Appendix #"
              options={appendixList ?? []}
              getOptionLabel={(option) => {
                return `Appendix ${option.appendix_no}: ${option.document_title}`;
              }}
              getOptionKey={(option) => option.id ?? ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            {selectedRequirementSource?.id === RequirementSourceEnum.EACA && (
              <ControlledTextField
                name="sourceAmendmentNumber"
                label="Amendment #"
                fullWidth
              />
            )}
            {selectedRequirementSource?.id !== RequirementSourceEnum.ORDER && (
              <Stack direction={"row"} gap={2}>
                <ControlledTextField
                  name="sourceNumber"
                  label={
                    isRequirementSourceCondition(
                      selectedRequirementSource?.id ?? ""
                    )
                      ? "Condition #"
                      : "Section #"
                  }
                  fullWidth
                />
                <ControlledTextField
                  name="sourceTitle"
                  label="Title"
                  fullWidth
                />
              </Stack>
            )}
            <ControlledLexicalEditor
              label="Description"
              name="description"
              isAdvanced
              isRequired={true}
            />
          </DialogContent>
          <ModalActions
            primaryActionButtonText={requirementSourceFormData ? "Save" : "Add"}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default RequirementSourceModal;
