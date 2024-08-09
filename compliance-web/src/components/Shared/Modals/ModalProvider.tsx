import React from "react";
import { Box, Modal } from "@mui/material";
import { useModal } from "@/store/modalStore";

const ModalProvider: React.FC = () => {
  const { modalContent, setClose, isOpen } = useModal();

  return (
    <Modal open={isOpen} onClose={setClose}>
      <Box>{modalContent}</Box>
    </Modal>
  );
};

export default ModalProvider;
