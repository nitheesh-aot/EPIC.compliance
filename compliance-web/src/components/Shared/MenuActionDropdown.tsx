import { ExpandMoreRounded } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import React from "react";

interface MenuAction {
  text: string;
  onClick: () => void;
  hidden?: boolean;
}

interface MenuActionDropdownProps {
  buttonText?: string;
  actions: MenuAction[];
}

const MenuActionDropdown: React.FC<MenuActionDropdownProps> = ({
  buttonText = "Actions",
  actions,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={handleClick}
        startIcon={<ExpandMoreRounded />}
      >
        {buttonText}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            width: 200,
          },
        }}
      >
        {actions
          .filter((item) => !item.hidden)
          .map((item) => (
            <MenuItem
              key={item.text}
              sx={{
                color: BCDesignTokens.typographyColorPrimary,
                padding: "0.5rem 1rem",
              }}
              onClick={() => {
                item.onClick();
                handleClose();
              }}
            >
              {item.text}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default MenuActionDropdown;
