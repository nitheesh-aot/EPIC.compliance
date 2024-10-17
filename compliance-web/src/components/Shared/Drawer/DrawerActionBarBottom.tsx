import React, { useMemo } from "react";
import { useDrawer } from "@/store/drawerStore";
import { Box, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useFormContext } from "react-hook-form";

const DrawerActionBarBottom: React.FC<{ isShowActionBar: boolean }> =
  React.memo(({ isShowActionBar }) => {
    const { setClose } = useDrawer();

    const {
      formState: { isValid, isDirty },
    } = useFormContext();

    const boxStyles = useMemo(
      () => ({
        backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
        padding: "0.75rem 2rem",
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
      }),
      []
    );

    return (
      isShowActionBar && (
        <Box sx={boxStyles}>
          <Button onClick={setClose} color="secondary" disabled={!isDirty}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid || !isDirty}>
            Save
          </Button>
        </Box>
      )
    );
  });

export default DrawerActionBarBottom;
