import React from "react";
import { Box, Modal } from "@mui/material";
import { useModal } from "@/store/modalStore";
import { theme } from "@/styles/theme";

const ModalProvider: React.FC = () => {
  const { modalContent, setClose, isOpen } = useModal();

  return (
    <Modal open={isOpen} onClose={setClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "95vw",
          maxHeight: "95vh",
          bgcolor: "background.paper",
          boxShadow: 12,
          overflowY: "scroll",
          color: theme.palette.text.primary,
        }}
      >
        {modalContent}
      </Box>
    </Modal>
  );
};

export default ModalProvider;
