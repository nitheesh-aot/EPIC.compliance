import { DialogContent } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { FC, useCallback, useEffect, useState } from "react";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { StaffUser } from "@/models/Staff";
import { STAFF_USER_POSITION } from "@/utils/constants";
import { useCreateIRApproval } from "@/hooks/useInspectionReports";
import { useReportStore } from "./reportStore";

type SendForApprovalModalProps = {
  staffUsers: StaffUser[];
  onSubmit: (message: string) => void;
};

const sendForApprovalSchema = yup.object().shape({
  director: yup
    .object<StaffUser>()
    .nullable()
    .required("Please select a director"),
});

type SendForApprovalFormType = yup.InferType<typeof sendForApprovalSchema>;

const initFormData = {
  director: undefined,
};

const SendForApprovalModal: FC<SendForApprovalModalProps> = ({
  onSubmit,
  staffUsers,
}) => {
  const [directorsList, setDirectorsList] = useState<StaffUser[]>([]);
  const { inspectionData, inspectionReportsData } = useReportStore();

  useEffect(() => {
    setDirectorsList(
      staffUsers?.filter((user) =>
        [
          STAFF_USER_POSITION.DIRECTOR,
          STAFF_USER_POSITION.DEPUTY_DIRECTOR,
        ].includes(user.position_id ?? 0)
      ) ?? []
    );
  }, [staffUsers]);

  const methods = useForm<SendForApprovalFormType>({
    resolver: yupResolver(sendForApprovalSchema),
    mode: "onBlur",
    defaultValues: initFormData,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initFormData);
  }, [reset]);

  const onSuccess = () => {
    onSubmit("Approval request sent");
  };

  const { mutate: createIRApproval, isPending } =
    useCreateIRApproval(onSuccess);

  const onSubmitHandler = useCallback(
    (data: SendForApprovalFormType) => {
      const directorId = (data.director as StaffUser).id;
      createIRApproval({
        inspectionId: inspectionData?.id ?? 0,
        inspectionRecordId: inspectionReportsData?.id ?? 0,
        approvalPayload: {
          approved_by_id: directorId,
        },
      });
    },
    [createIRApproval, inspectionData, inspectionReportsData]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title={"Send for Deputy Approval?"} />
        <DialogContent dividers>
          <ControlledAutoComplete
            name="director"
            label="Deputy Director"
            placeholder="Select Deputy Director"
            options={directorsList ?? []}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name}`
            }
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
            sx={{ mb: "-0.5rem" }}
            disabled={!directorsList?.length}
            isRequired={true}
          />
        </DialogContent>
        {directorsList && directorsList.length > 0 && (
          <ModalActions
            primaryActionButtonText={"Send"}
            isButtonValidation
            isLoading={isPending}
          />
        )}
      </form>
    </FormProvider>
  );
};

export default SendForApprovalModal;
