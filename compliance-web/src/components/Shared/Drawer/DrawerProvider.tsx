import React from "react";
import { Box, Drawer } from "@mui/material";
import { useDrawer } from "@/store/drawerStore";
import { useMenuStore } from "@/store/menuStore";
import { BCDesignTokens } from "epic.theme";

const DrawerProvider: React.FC = () => {
  const { drawerContent, setClose, isOpen, drawerWidth } = useDrawer();
  const { appHeaderHeight } = useMenuStore();

  return (
    <Drawer
      anchor={"right"}
      open={isOpen}
      onClose={setClose}
      variant="persistent"
      sx={{
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
          boxShadow: BCDesignTokens.surfaceShadowSmall,
          height: `calc(100vh - ${appHeaderHeight}px)`,
          top: appHeaderHeight,
        },
      }}
    >
      <Box role="presentation" sx={{ width: drawerWidth }}>
        {drawerContent}
      </Box>
    </Drawer>
  );
};

export default DrawerProvider;
