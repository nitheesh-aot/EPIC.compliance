import { DialogContent, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
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
import { useInspectionOrdersData } from "@/hooks/useInspectionOrders";

type RequirementSourceModalProps = {
  onSubmit: (data: RequirementSourceFormData) => void;
  inspectionId: number;
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
  appendix: undefined,
  sourceNumber: "",
  sourceTitle: "",
  sourceAmendmentNumber: "",
  description: undefined,
};

const RequirementSourceModal: React.FC<RequirementSourceModalProps> = ({
  onSubmit,
  inspectionId,
  requirementSourceFormData,
  requirementSource,
  order,
  appendixList,
}) => {
  const { data: requirementSourceList } = useRequirementSourcesData();
  const { data: orderList } = useInspectionOrdersData(inspectionId);

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

  const { handleSubmit, reset, control, getValues } = methods;

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
    if (selectedOrder?.now_therefore) {
      const newValue = {
        html: selectedOrder.now_therefore,
        text: selectedOrder.now_therefore,
      };
      methods.setValue("description", newValue);
    }
  }, [selectedOrder, methods]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: RequirementSourceSchemaType) => {
    const formData = data as RequirementSourceFormData;
    if (!requirementSourceFormData) {
      formData.id = Date.now();
    }
    onSubmit(formData);
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
              label="Appendix"
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
