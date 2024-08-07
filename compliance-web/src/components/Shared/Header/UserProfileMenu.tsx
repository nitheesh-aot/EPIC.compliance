import { Menu, Box, Avatar, Typography } from "@mui/material";
import { BCPalette } from "epic.theme";
import CopyButton from "@/components/Shared/CopyButton";
import { theme } from "@/styles/theme";
import { useAuth } from "react-oidc-context";

export default function UserProfileMenu({ ...props }) {
  const { user } = useAuth();

  return (
    <Menu
      id="profile-menu"
      anchorEl={props.anchorEl}
      open={Boolean(props.anchorEl)}
      onClose={props.handleClose}
      MenuListProps={{
        style: {
          paddingTop: 0,
          paddingBottom: 0,
          pointerEvents: "auto",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", width: 320 }}>
        <Box
          sx={{
            display: "flex",
            gap: "0.5rem",
            padding: "1rem",
            bgcolor: BCPalette.components.background.lightGray,
            borderBottom: `1px solid ${BCPalette.components.border.light}`,
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: "2rem",
              height: "2rem",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color={theme.palette.primary.contrastText}
            >{`${user?.profile?.given_name?.charAt(0)}${user?.profile?.family_name?.charAt(0)}`}</Typography>
          </Avatar>
          <Typography
            variant="body2"
            fontWeight={700}
          >{`${user?.profile?.name}`}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            padding: "1rem",
            flexDirection: "column",
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Contact
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {userDetails(user?.profile?.email)}
            {userDetails(user?.profile?.phone_number)}
          </Box>
        </Box>
      </Box>
    </Menu>
  );

  function userDetails(detail?: string) {
    return (
      detail && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color={BCPalette.theme.primaryBlue[90]}>
            {detail}
          </Typography>
          <CopyButton copyText={detail} />
        </Box>
      )
    );
  }
}
