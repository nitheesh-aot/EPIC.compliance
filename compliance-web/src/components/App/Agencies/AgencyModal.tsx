import ModalCloseIconButton from "@/components/Shared/Modals/ModalCloseIconButton";
import { useModal } from "@/store/modalStore";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Agency } from "@/models/Agency";

type AgencyModalProps = {
  onSubmit: () => void;
  agency?: Agency;
};

const initFormData: Omit<Agency, "id"> = {
  name: "",
  abbreviation: "",
};

const AgencyModal: React.FC<AgencyModalProps> = ({ onSubmit, agency }) => {
  const [formData, setFormData] = useState<Omit<Agency, "id">>(initFormData);
  const { setClose } = useModal();

  useEffect(() => {
    if (agency) {
      setFormData(agency);
    } else {
      setFormData(initFormData);
    }
  }, [agency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log(formData);
    // if (user) {
    //   updateUser({ ...user, ...formData });
    // } else {
    //   addUser(formData);
    // }
    onSubmit();
  };

  const handleClose = () => {
    // reset();
    setFormData(initFormData);
    setClose();
  };

  return (
    <Box width="520px">
      <DialogTitle>{agency ? agency.name : "Add Agency"}</DialogTitle>
      <ModalCloseIconButton handleClose={handleClose} />
      <Divider />
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Abbreviation (optional)"
          name="abbreviation"
          value={formData.abbreviation}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ paddingX: "1.5rem", paddingY: "1rem" }}>
        <Button variant={"text"} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant={"contained"} onClick={handleSubmit}>
          {agency ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AgencyModal;
