import React from "react";
import { useDrawer } from "@/store/drawerStore";
import { Box, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useFormContext } from "react-hook-form";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

type DrawerActionBarBottomProps = {
  isShowActionBar: boolean;
  onDeleteAction?: () => void;
  onDeleteTitle?: string;
  onDeleteDescription?: string;
  isDirtyManual?: boolean;
};

const DrawerActionBarBottom: React.FC<DrawerActionBarBottomProps> = React.memo(
  ({
    isShowActionBar,
    onDeleteAction,
    onDeleteTitle,
    onDeleteDescription,
    isDirtyManual,
  }) => {
    const { setClose } = useDrawer();
    const { setOpen, setClose: setModalClose } = useModal();

    const {
      formState: { isValid, isDirty },
    } = useFormContext();

    const handleDelete = () => {
      setOpen({
        content: (
          <ConfirmationModal
            title={onDeleteTitle ?? "Delete"}
            description={
              onDeleteDescription ??
              "Are you sure you want to delete this item?"
            }
            confirmButtonText="Delete"
            onConfirm={() => {
              onDeleteAction?.();
              setModalClose();
            }}
          />
        ),
      });
    };

    return (
      isShowActionBar && (
        <Box
          sx={{
            backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
            padding: "0.75rem 2rem",
            display: "flex",
            justifyContent: onDeleteAction ? "space-between" : "flex-end",
          }}
        >
          {onDeleteAction && (
            <Button
              variant="text"
              startIcon={<DeleteOutlineRounded />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Button
              onClick={setClose}
              color="secondary"
              disabled={!isDirtyManual && !isDirty}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || (!isDirtyManual && !isDirty)}
            >
              Save
            </Button>
          </Box>
        </Box>
      )
    );
  }
);

export default DrawerActionBarBottom;
