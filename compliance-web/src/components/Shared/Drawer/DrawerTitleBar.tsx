import { theme } from "@/styles/theme";
import { Close } from "@mui/icons-material";
import { Box, Typography, IconButton } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { useFormContext } from "react-hook-form";
import { useDrawer } from "@/store/drawerStore";
import { FC, useEffect, useCallback } from "react";

type DrawerTitleBarProps = {
  title: string;
  isFormDirtyCheck?: boolean;
};

const DrawerTitleBar: FC<DrawerTitleBarProps> = ({
  title,
  isFormDirtyCheck,
}) => {
  const { isOpen, setClose } = useDrawer();
  const { setOpen: setModalOpen, setClose: setModalClose } = useModal();
  const {
    reset,
    formState: { isDirty, defaultValues },
  } = useFormContext();

  useEffect(() => {
    if (!isOpen) reset(defaultValues);
  }, [isOpen, reset, defaultValues]);

  const handleClose = useCallback(() => {
    if (isFormDirtyCheck && isDirty) {
      setModalOpen({
        content: (
          <ConfirmationModal
            title="Discard Changes?"
            description="You have unsaved changes. Are you sure you want to discard them?"
            confirmButtonText="Yes"
            cancelButtonText="No"
            onConfirm={() => {
              setClose();
              setModalClose();
            }}
          />
        ),
      });
    } else {
      setClose();
    }
  }, [isFormDirtyCheck, isDirty, setModalOpen, setModalClose, setClose]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 2rem",
        borderBottom: `1px solid ${BCDesignTokens.supportBorderColorInfo}`,
      }}
    >
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{ color: theme.palette.text.primary }}
      >
        <Close />
      </IconButton>
    </Box>
  );
};

export default DrawerTitleBar;
