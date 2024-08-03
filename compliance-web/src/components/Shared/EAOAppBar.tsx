import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Box,
  Button,
  Grid,
  styled,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import BC_Logo from "@/assets/images/bcgovLogoWhite.svg";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AppConfig } from "@/utils/config";
import { useAuth } from "react-oidc-context";
import EnvironmentBanner from "./EnvironmentBanner";
import { forwardRef, HTMLProps } from "react";


type EAOAppBarProps = HTMLProps<HTMLDivElement>;
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const EAOAppBar = forwardRef<HTMLDivElement, EAOAppBarProps>((_props, ref) => {
  const theme = useTheme();
  const auth = useAuth();
  return (
    <>
      <AppBar ref={ref} position="static" color="primary" open={true}>
        <Grid
          container
          padding={"0.938rem 1.5rem"}
          margin={0}
          height={72}
          justifyContent="space-between"
        >
          <Grid display="flex" justifyContent="start" alignItems="center">
            <img src={BC_Logo} height={42} />
            <Typography
              variant="h3"
              color="inherit"
              component="div"
              paddingLeft={"2.5rem"}
              fontWeight={"bold"}
            >
              {AppConfig.appTitle}
            </Typography>
          </Grid>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            paddingRight={"0.75rem"}
          >
            <AccountCircleIcon
              fontSize="large"
              color="primary"
              sx={{ marginRight: "0.25rem" }}
            ></AccountCircleIcon>
            {auth.isAuthenticated ? (
              <>
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  marginRight={"1rem"}
                >
                  <Typography variant="h6" color="inherit">
                    Hello, {auth.user?.profile.name}
                  </Typography>
                </Box>
                {/* <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => auth.signoutRedirect()}
                >
                  Sign Out
                </Button> */}
                <Avatar
                  sx={{
                    bgcolor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    width: "2rem",
                    height: "2rem",
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={700}
                  >{`${auth.user?.profile?.given_name?.charAt(0)}${auth.user?.profile?.family_name?.charAt(0)}`}</Typography>
                </Avatar>
              </>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => auth.signinRedirect()}
              >
                Sign In
              </Button>
            )}
          </Grid>
        </Grid>
        <EnvironmentBanner></EnvironmentBanner>
      </AppBar>
    </>
  );
});

export default EAOAppBar;
