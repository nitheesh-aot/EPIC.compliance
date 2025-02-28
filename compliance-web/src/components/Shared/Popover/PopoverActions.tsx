import { usePopover } from "@/store/popoverStore";
import { DeleteOutlineRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  Typography,
} from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";

type PopoverActionsProps = {
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  isButtonValidation?: boolean;
  onDeleteAction?: () => void;
  onDeleteConfirmationText?: string;
  isLoading?: boolean;
};

const PopoverActions: FC<PopoverActionsProps> = ({
  primaryActionButtonText,
  secondaryActionButtonText,
  onPrimaryAction,
  onSecondaryAction,
  isButtonValidation,
  onDeleteAction,
  onDeleteConfirmationText = "Are you sure you want to delete this?",
  isLoading = false,
}) => {
  const { setClose } = usePopover();
  const formContext = useFormContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isValid = isButtonValidation ? formContext?.formState.isValid : true;

  return (
    <>
      {!showDeleteConfirmation && (
        <DialogActions
          sx={{
            padding: 2,
            justifyContent: onDeleteAction ? "space-between" : "flex-end",
          }}
        >
          {onDeleteAction && (
            <Button
              variant="text"
              sx={{ height: 32 }}
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
              sx={{ height: 32 }}
              onClick={() => {
                onSecondaryAction?.();
                setClose();
              }}
              disabled={showDeleteConfirmation}
            >
              {secondaryActionButtonText ?? "Cancel"}
            </Button>
            <Button
              sx={{ minWidth: 100, height: 32 }}
              type={onPrimaryAction ? "button" : "submit"}
              onClick={onPrimaryAction}
              disabled={
                (!!isButtonValidation && !isValid) || showDeleteConfirmation
              }
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                (primaryActionButtonText ?? "Ok")
              )}
            </Button>
          </Box>
        </DialogActions>
      )}
      {showDeleteConfirmation && (
        <Box
          sx={{
            background: BCDesignTokens.supportSurfaceColorDanger,
            borderTop: `${BCDesignTokens.layoutBorderWidthSmall} solid ${BCDesignTokens.surfaceColorBorderDefault}`,
            padding: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body1" fontWeight={"bold"}>
              {onDeleteConfirmationText ?? "Delete?"}
            </Typography>
          </Box>
          <Button
            sx={{ minWidth: 100, height: 32 }}
            color="secondary"
            onClick={() => {
              setShowDeleteConfirmation(false);
            }}
          >
            No, Cancel
          </Button>
          <Button
            sx={{ minWidth: 100, height: 32 }}
            onClick={onDeleteAction}
            color="error"
          >
            Yes, Delete
          </Button>
        </Box>
      )}
    </>
  );
};

export default PopoverActions;
