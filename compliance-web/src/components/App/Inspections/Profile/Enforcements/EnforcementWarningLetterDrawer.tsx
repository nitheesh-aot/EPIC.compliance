import DrawerActionBarBottom from "@/components/Shared/Drawer/DrawerActionBarBottom";
import DrawerTitleBar from "@/components/Shared/Drawer/DrawerTitleBar";
import { Inspection } from "@/models/Inspection";
import { useMenuStore } from "@/store/menuStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { StaffUser } from "@/models/Staff";
import dayjs, { Dayjs } from "dayjs";
import ControlledLexicalEditor from "@/components/Shared/Controlled/ControlledLexicalEditor";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import { BCDesignTokens } from "epic.theme";
import {
  InspectionWarningLetter,
  InspectionWarningLetterAPIData,
} from "@/models/InspectionWarningLetter";
import {
  useDeleteWarningLetter,
  useUpdateWarningLetter,
} from "@/hooks/useInspectionWarningLetters";
import EnforcementDownloadPDFButton from "./EnforcementDownloadPDFButton";
import { EnforcementActionEnum } from "@/utils/constants";
import WarningLetterApprovalButtons from "./WarningLetterApprovalButtons";

type EnforcementWarningLetterDrawerProps = {
  onSubmit: (submitMsg: string) => void;
  inspection: Inspection;
  warningLetter: InspectionWarningLetter;
  staffUsersList: StaffUser[];
};

const warningLetterFormSchema = yup.object().shape({
  content: yup
    .object({
      html: yup.string(),
      text: yup.string(),
    })
    .nullable(),
  issuingOfficer: yup
    .object<StaffUser>()
    .nullable()
    .required("Issuing Officer is required"),
  intendedIssuanceDate: yup.mixed<Dayjs>().nullable().typeError("Invalid date"),
});

type EnforcementFormType = yup.InferType<typeof warningLetterFormSchema>;

const initFormData = {
  content: { html: "", text: "" },
  issuingOfficer: {} as StaffUser,
  intendedIssuanceDate: undefined,
};

const EnforcementWarningLetterDrawer: React.FC<
  EnforcementWarningLetterDrawerProps
> = ({ onSubmit, inspection, warningLetter, staffUsersList }) => {
  const { appHeaderHeight } = useMenuStore();

  const defaultValues = useMemo<EnforcementFormType>(() => {
    if (warningLetter) {
      return {
        content: {
          html: warningLetter.content,
          text: warningLetter.content,
        },
        issuingOfficer: warningLetter.issuing_officer as StaffUser,
        intendedIssuanceDate: warningLetter.intended_issuance_date
          ? dayjs(warningLetter.intended_issuance_date)
          : undefined,
      };
    }
    return initFormData;
  }, [warningLetter]);

  const methods = useForm<EnforcementFormType>({
    resolver: yupResolver(warningLetterFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSuccess = useCallback(() => {
    onSubmit("Changes saved successfully!");
    reset();
  }, [onSubmit, reset]);

  const { mutate: updateWarningLetter } = useUpdateWarningLetter(onSuccess);

  const onSubmitHandler = useCallback(
    (formData: EnforcementFormType) => {
      if (warningLetter) {
        const warningLetterData: InspectionWarningLetterAPIData = {
          inspection_id: inspection.id,
          inspection_requirement_ids:
            warningLetter.warning_letter_requirement_map?.map(
              (map) => map.inspection_requirement_id
            ) || [],
          content: formData.content?.html || undefined,
          issuing_officer_id: (formData.issuingOfficer as StaffUser).id,
          intended_issuance_date:
            formData.intendedIssuanceDate?.toISOString() || undefined,
        };

        updateWarningLetter({
          inspectionWarningLetterId: warningLetter.id || 0,
          inspectionWarningLetter: warningLetterData,
        });
      }
    },
    [inspection.id, updateWarningLetter, warningLetter]
  );

  const onDeleteSuccess = useCallback(() => {
    onSubmit("Warning letter deleted successfully!");
    reset();
  }, [onSubmit, reset]);

  const { mutate: deleteWarningLetter } = useDeleteWarningLetter(onDeleteSuccess);

  const onDeleteWarningLetter = useCallback(() => {
    deleteWarningLetter({
      inspectionWarningLetterId: warningLetter.id || 0,
    });
  }, [deleteWarningLetter, warningLetter.id]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <DrawerTitleBar
          title={warningLetter.warning_letter_number || "Edit Warning Letter"}
          isFormDirtyCheck
        />
        <Box
          sx={{
            backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
            padding: "0.75rem 2rem",
            textAlign: "right",
          }}
        >
          <WarningLetterApprovalButtons
            warningLetter={warningLetter}
            inspectionId={inspection.id}
          />
          <EnforcementDownloadPDFButton
            enforcementId={warningLetter.id || 0}
            fileNumber={warningLetter.warning_letter_number || ""}
            enforcementType={EnforcementActionEnum.WARNING_LETTER}
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
              label=""
              name="content"
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
            <ControlledDateField
              className="cy-intended-issuance-date"
              name="intendedIssuanceDate"
              label="Intended Issuance Date"
              sx={{ width: "100%" }}
            />
          </Box>
        </Stack>
        <DrawerActionBarBottom
          isShowActionBar={!!warningLetter}
          onDeleteAction={onDeleteWarningLetter}
          onDeleteTitle="Delete Warning Letter"
          onDeleteDescription={`You are about to delete Warning Letter ${warningLetter.warning_letter_number}. Are you sure?`}
        />
      </form>
    </FormProvider>
  );
};

export default EnforcementWarningLetterDrawer;
