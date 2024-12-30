import { FC } from "react";
import { Box, Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import RequirementSourceModal from "./RequirementSourceModal";


const RequirementFormRight: FC = () => {
  const { setOpen, setClose } = useModal();

  const handleOnSubmit = (submitMsg: string) => {
    setClose();
    notify.success(submitMsg);
  };
  
  const handleAddRequirementSourceModal = () => {
    setOpen({
      content: <RequirementSourceModal onSubmit={handleOnSubmit} />,
      width: "640px",
    });
  };

  return (
    <Box
      sx={{
        paddingTop: "1.5rem",
        paddingX: "1rem",
        width: "510px",
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddRequirementSourceModal}
        startIcon={<AddRounded />}
      >
        Requirement Source
      </Button>
    </Box>
  );
};

export default RequirementFormRight;
