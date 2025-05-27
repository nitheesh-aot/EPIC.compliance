import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import {
  InspectionOrder,
  InspectionOrderAPIData,
} from "@/models/InspectionOrder";
import { Inspection } from "@/models/Inspection";
import { useMenuStore } from "@/store/menuStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { useUpdateInspectionOrder } from "@/hooks/useInspectionOrders";
import { StaffUser } from "@/models/Staff";
import dayjs, { Dayjs } from "dayjs";
import { EnforcementSection } from "@/models/EnforcementSection";
import ControlledLexicalEditor from "@/components/Shared/Controlled/ControlledLexicalEditor";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { useEnforcementSectionsData } from "@/hooks/useEnforcementSections";
import { BCDesignTokens } from "epic.theme";
import { SendRounded } from "@mui/icons-material";
import EnforcementDownloadPDFButton from "./EnforcementDownloadPDFButton";
import { EnforcementActionEnum } from "@/utils/constants";

type EnforcementOrderDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  inspection: Inspection;
  enforcementOrder: InspectionOrder;
  staffUsersList: StaffUser[];
};

const enforcementSchema = yup.object().shape({
  whereAs: yup
    .object({
      html: yup.string(),
      text: yup.string(),
    })
    .nullable(),
  nowTherefore: yup
    .object({
      html: yup.string(),
      text: yup.string(),
    })
    .nullable(),
  issuingOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Issuing Officer is required"),
  section: yup.object<EnforcementSection>().required("Section is required"),
  intendedIssuanceDate: yup.mixed<Dayjs>().nullable().typeError("Invalid date"),
});

type EnforcementFormType = yup.InferType<typeof enforcementSchema>;

const initFormData = {
  whereAs: { html: "", text: "" },
  nowTherefore: { html: "", text: "" },
  issuingOfficer: {} as StaffUser,
  section: {} as EnforcementSection,
  intendedIssuanceDate: undefined,
};

const EnforcementOrderDrawer: React.FC<EnforcementOrderDrawerProps> = ({
  onSubmit,
  inspection,
  enforcementOrder,
  staffUsersList,
}) => {
  const { appHeaderHeight } = useMenuStore();
  const { data: enforcementSections } = useEnforcementSectionsData();

  const defaultValues = useMemo<EnforcementFormType>(() => {
    if (enforcementOrder) {
      return {
        whereAs: {
          html: enforcementOrder.where_as,
          text: enforcementOrder.where_as,
        },
        nowTherefore: {
          html: enforcementOrder.now_therefore,
          text: enforcementOrder.now_therefore,
        },
        issuingOfficer: enforcementOrder.issuing_officer as StaffUser,
        section: enforcementOrder.section as EnforcementSection,
        intendedIssuanceDate: enforcementOrder.intended_issuance_date
          ? dayjs(enforcementOrder.intended_issuance_date)
          : undefined,
      };
    }
    return initFormData;
  }, [enforcementOrder]);

  const methods = useForm<EnforcementFormType>({
    resolver: yupResolver(enforcementSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!");
    reset();
  }, [onSubmit, reset]);

  const { mutate: updateInspectionOrder } = useUpdateInspectionOrder(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: EnforcementFormType) => {
      if (enforcementOrder) {
        const orderData: InspectionOrderAPIData = {
          inspection_requirement_ids:
            enforcementOrder.order_requirement_maps?.map(
              (map) => map.inspection_requirement_id
            ) || [],
          where_as: formData.whereAs?.html || undefined,
          now_therefore: formData.nowTherefore?.html || undefined,
          issuing_officer_id: (formData.issuingOfficer as StaffUser).id,
          section_id: (formData.section as EnforcementSection).id,
          intended_issuance_date:
            formData.intendedIssuanceDate?.toISOString() || undefined,
        };

        updateInspectionOrder({
          inspectionId: inspection.id,
          inspectionOrderId: enforcementOrder.id || 0,
          inspectionOrder: orderData,
        });
      }
    },
    [enforcementOrder, inspection.id, updateInspectionOrder]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={enforcementOrder.order_number || "Edit Order"}
          isFormDirtyCheck
        />
        <Box
          sx={{
            backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
            padding: "0.75rem 2rem",
            textAlign: "right",
          }}
        >
          <Button variant="text">
            <SendRounded sx={{ mr: 1, fontSize: 20 }} />
            Send for Approval
          </Button>
          <EnforcementDownloadPDFButton
            inspectionId={inspection.id}
            enforcementId={enforcementOrder.id || 0}
            fileNumber={enforcementOrder.order_number || ""}
            enforcementType={EnforcementActionEnum.ORDER}
          />
        </Box>
        <Stack
          /** 64px (DrawerTitleBar height) + 65px (DrawerActionBar height) + 64px (DrawerActionBarTop preview height) */
          height={`calc(100vh - ${appHeaderHeight + 193}px)`}
          direction={"row"}
        >
          <Box
            sx={{
              background: BCDesignTokens.surfaceColorBackgroundLightGray,
              padding: "0.5rem 1rem 1rem 2rem",
              width: "718px",
              overflow: "auto",
              boxSizing: "border-box",
            }}
          >
            <ControlledLexicalEditor
              label="WHEREAS & DEFINITIONS"
              name="whereAs"
              height={`calc(100vh - ${appHeaderHeight + 235}px)`}
            />
          </Box>
          <Box
            sx={{
              padding: "1.5rem 2rem 1rem 1rem",
              width: "510px",
              overflow: "auto",
              boxSizing: "border-box",
            }}
          >
            <ControlledAutoComplete
              name="issuingOfficer"
              label="Issuing Officer Name"
              options={staffUsersList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
              isSortOptions
              isRequired={true}
            />
            <Stack direction={"row"} gap={2}>
              <ControlledAutoComplete
                name="section"
                label="Section"
                options={enforcementSections || []}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.id}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
                isRequired={true}
              />
              <ControlledDateField
                className="cy-intended-issuance-date"
                name="intendedIssuanceDate"
                label="Intended Issuance Date"
                sx={{ width: "100%" }}
              />
            </Stack>
            <ControlledLexicalEditor
              label="NOW THEREFORE"
              name="nowTherefore"
              height={`calc(100vh - ${appHeaderHeight + 428}px)`}
            />
          </Box>
        </Stack>
        <DrawerActionBarBottom isShowActionBar={!!enforcementOrder} />
      </form>
    </FormProvider>
  );
};

export default EnforcementOrderDrawer;
