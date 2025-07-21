import { FormControlLabel, Typography, CircularProgress } from "@mui/material";
import CustomSwitch from "@/components/Shared/Controlled/CustomSwitch";
import { useAuth } from "react-oidc-context";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useMemo } from "react";

interface ShowOnlyMyRequirementsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean, staffId?: number) => void;
}

const ShowOnlyMyRequirementsSwitch: React.FC<ShowOnlyMyRequirementsSwitchProps> = ({ checked, onChange }) => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: staffUsers, isLoading: staffLoading } = useStaffUsersData();

  // Find current user in staff list
  const currentStaff = useMemo(() => {
    if (!currentUser?.profile?.preferred_username || !staffUsers) return undefined;
    return staffUsers.find(
      (staff) => staff.auth_user_guid === currentUser.profile.preferred_username
    );
  }, [currentUser?.profile?.preferred_username, staffUsers]);

  if (authLoading || staffLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <FormControlLabel
      control={
        <CustomSwitch
          checked={checked}
          onChange={(_, value) => onChange(value, currentStaff?.id)}
          size="small"
        />
      }
      label={
        <Typography variant="body1" mr={1}>
          <strong>{currentUser?.profile?.given_name || "My"}</strong>'s Files
        </Typography>
      }
      labelPlacement="start"
      disabled={!currentStaff}
      sx={{
        marginRight: -1,
      }}
    />
  );
};

export default ShowOnlyMyRequirementsSwitch; 
