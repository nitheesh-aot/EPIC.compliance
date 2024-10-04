import { useModal } from "@/store/modalStore";
import { Close } from "@mui/icons-material";
import { Box, Typography, IconButton } from "@mui/material";
import { FC } from "react";

type ModalTitleBarProps = {
  title: string;
  onClose?: () => void;
};

const ModalTitleBar: FC<ModalTitleBarProps> = ({ title, onClose }) => {
  const { setClose } = useModal();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
        paddingRight: "1rem",
      }}
    >
      <Typography variant="h5">{title}</Typography>
      <IconButton
        aria-label="close"
        onClick={() => {
          onClose?.();
          setClose();
        }}
      >
        <Close />
      </IconButton>
    </Box>
  );
};

export default ModalTitleBar;
