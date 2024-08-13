import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";


const ModalCloseIconButton = ({ ...props }) => {
  return (
    <IconButton
      aria-label="close"
      onClick={props.handleClose}
      sx={{
        position: "absolute",
        right: 12,
        top: 8,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Close />
    </IconButton>
  );
};

export default ModalCloseIconButton;
