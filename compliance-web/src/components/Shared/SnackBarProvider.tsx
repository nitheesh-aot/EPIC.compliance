import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useSnackbar } from "@/store/snackbarStore";

const SnackBarProvider: React.FC = () => {
  const { isOpen, setClose, severity, message } = useSnackbar();

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={3000}
      onClose={setClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={setClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBarProvider;
