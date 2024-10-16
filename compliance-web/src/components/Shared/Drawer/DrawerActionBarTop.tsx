import React from "react";
import { Box, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

const DrawerActionBarTop: React.FC<{ isShowActionBar: boolean }> = React.memo(
  ({ isShowActionBar }) => {
    return isShowActionBar ? (
      <Box
        sx={{
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
          padding: "0.75rem 2rem",
          textAlign: "right",
        }}
      >
        <Button type="submit">Create</Button>
      </Box>
    ) : null;
  }
);

export default DrawerActionBarTop;
