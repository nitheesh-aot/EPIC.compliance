import ModalCloseIconButton from "@/components/Shared/Modals/ModalCloseIconButton";
import { useModal } from "@/store/modalStore";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { Agency } from "@/models/Agency";
import { useAddAgency, useUpdateAgency } from "@/hooks/useAgencies";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { notify } from "@/store/snackbarStore";
import { AxiosError } from "axios";

type AgencyModalProps = {
  onSubmit: (submitMsg: string) => void;
  agency?: Agency;
};

const agencySchema = yup.object().shape({
  name: yup.string().required("Name is required").max(150, "Max length exceeded"),
  abbreviation: yup.string().optional().max(10, "Max length exceeded"),
});

type AgencyForm = yup.InferType<typeof agencySchema>;

const AgencyModal: React.FC<AgencyModalProps> = ({ onSubmit, agency }) => {
  const { setClose } = useModal();

  const onSuccess = () => {
    onSubmit(agency ? "Successfully updated!" : "Successfully added!");
  };

  const onError = (err: AxiosError) => {
    // eslint-disable-next-line no-console
    console.log(typeof err);
    notify.error(err?.message);
  };

  const { mutate: addAgency, reset: resetAddQuery } = useAddAgency(onSuccess, onError);
  const { mutate: updateAgency, reset: resetUpdateQuery } = useUpdateAgency(onSuccess, onError);

  const methods = useForm({
    resolver: yupResolver(agencySchema),
    mode: "onBlur",
    defaultValues: agency,
  });

  const { handleSubmit } = methods;

  const onSubmitHandler = async (data: AgencyForm) => {
    const agencyData = {
      name: data.name,
      abbreviation: data.abbreviation,
    };
    if (agency) {
      updateAgency({ id: agency.id, agency: agencyData });
    } else {
      addAgency(agencyData);
    }
  };

  const handleClose = () => {
    agency ? resetUpdateQuery() : resetAddQuery();
    methods.reset();
    setClose();
  };

  return (
    <Box width="520px">
      <DialogTitle>{agency ? agency.name : "Add Agency"}</DialogTitle>
      <ModalCloseIconButton handleClose={handleClose} />
      <Divider />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <DialogContent>
            <ControlledTextField label="Name" name="name" fullWidth />
            <ControlledTextField
              label="Abbreviation (optional)"
              name="abbreviation"
              fullWidth
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ paddingX: "1.5rem", paddingY: "1rem" }}>
            <Button variant={"text"} onClick={handleClose}>
              Cancel
            </Button>
            <Button variant={"contained"} type="submit">
              {agency ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Box>
  );
};

export default AgencyModal;
