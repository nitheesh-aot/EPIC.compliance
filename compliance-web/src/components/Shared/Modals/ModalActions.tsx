import { useModal } from "@/store/modalStore";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { Box, Button, DialogActions, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";

type ModalActionsProps = {
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  isButtonValidation?: boolean;
  onDeleteAction?: () => void;
};

const ModalActions: FC<ModalActionsProps> = ({
  primaryActionButtonText,
  secondaryActionButtonText,
  onPrimaryAction,
  onSecondaryAction,
  isButtonValidation,
  onDeleteAction,
}) => {
  const { setClose } = useModal();
  const formContext = useFormContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isValid = isButtonValidation ? formContext?.formState.isValid : true;

  return (
    <>
      <DialogActions
        sx={{
          padding: "1rem 1.5rem",
          justifyContent: onDeleteAction ? "space-between" : "flex-end",
        }}
      >
        {onDeleteAction && (
          <Button
            variant="text"
            startIcon={<DeleteOutlineRounded />}
            onClick={() => {
              setShowDeleteConfirmation(true);
            }}
            disabled={showDeleteConfirmation}
          >
            Delete
          </Button>
        )}
        <Box sx={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant="text"
            onClick={() => {
              onSecondaryAction?.();
              setClose();
            }}
            disabled={showDeleteConfirmation}
          >
            {secondaryActionButtonText ?? "Cancel"}
          </Button>
          <Button
            sx={{ minWidth: 100 }}
            type={onPrimaryAction ? "button" : "submit"}
            onClick={onPrimaryAction}
            disabled={
              (!!isButtonValidation && !isValid) || showDeleteConfirmation
            }
          >
            {primaryActionButtonText ?? "Ok"}
          </Button>
        </Box>
      </DialogActions>
      {showDeleteConfirmation && (
        <Box
          sx={{
            background: BCDesignTokens.surfaceColorBackgroundLightBlue,
            borderTop: `${BCDesignTokens.layoutBorderWidthSmall} solid ${BCDesignTokens.surfaceColorBorderDefault}`,
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body1" fontWeight={"bold"}>
              Delete Confirmation
            </Typography>
            <Typography variant="body1">
              Are you sure you want to delete this entry?
            </Typography>
          </Box>
          <Button
            sx={{ minWidth: 100, height: 40 }}
            color="secondary"
            onClick={() => {
              setShowDeleteConfirmation(false);
            }}
          >
            No, Cancel
          </Button>
          <Button sx={{ minWidth: 100, height: 40 }} onClick={onDeleteAction}>
            Yes, Delete
          </Button>
        </Box>
      )}
    </>
  );
};

export default ModalActions;
