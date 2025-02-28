import React from "react";
import { Box, Popover } from "@mui/material";
import { usePopover } from "@/store/popoverStore";

const PopoverProvider: React.FC = () => {
  const { anchorEl, popoverContent, setClose, popoverWidth } = usePopover();

  // Don't render the Popover if there's no anchor element
  if (!anchorEl) return null;

  return (
    <Popover
      id="simple-popover"
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={setClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <Box width={popoverWidth}>{popoverContent}</Box>
    </Popover>
  );
};

export default PopoverProvider;
