import React from "react";
import { Box, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useFormContext } from "react-hook-form";

const DrawerActionBarTop: React.FC<{ isShowActionBar: boolean }> = React.memo(
  ({ isShowActionBar }) => {
    const {
      formState: { isValid },
    } = useFormContext();

    return isShowActionBar ? (
      <Box
        sx={{
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
          padding: "0.75rem 2rem",
          textAlign: "right",
        }}
      >
        <Button type="submit" disabled={!isValid}>
          Create
        </Button>
      </Box>
    ) : null;
  }
);

export default DrawerActionBarTop;
