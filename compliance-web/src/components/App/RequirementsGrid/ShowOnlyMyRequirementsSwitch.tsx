import { FormControlLabel, Typography, CircularProgress } from "@mui/material";
import CustomSwitch from "@/components/Shared/Controlled/CustomSwitch";
import { useAuth } from "react-oidc-context";
import { useStaffUsersData } from "@/hooks/useStaff";
import { useMemo } from "react";
import { STAFF_USER_POSITION } from "@/utils/constants";

interface ShowOnlyMyRequirementsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean, staffId?: number) => void;
  disabled?: boolean;
}

const ShowOnlyMyRequirementsSwitch: React.FC<
  ShowOnlyMyRequirementsSwitchProps
> = ({ checked, onChange, disabled = false }) => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: staffUsers, isLoading: staffLoading } = useStaffUsersData();

  // Find current user in staff list
  const currentStaff = useMemo(() => {
    if (!currentUser?.profile?.preferred_username || !staffUsers)
      return undefined;
    return staffUsers.find(
      (staff) => staff.auth_user_guid === currentUser.profile.preferred_username
    );
  }, [currentUser?.profile?.preferred_username, staffUsers]);

  // Check if current user is a deputy director
  const isCurrentUserDeputy = useMemo(() => {
    return currentStaff?.position_id === STAFF_USER_POSITION.DEPUTY_DIRECTOR;
  }, [currentStaff?.position_id]);

  // Determine if switch should be disabled
  const isSwitchDisabled = useMemo(() => {
    return disabled || authLoading || staffLoading || !currentStaff;
  }, [disabled, authLoading, staffLoading, currentStaff]);

  // Get the appropriate label based on user role
  const getSwitchLabel = useMemo(() => {
    if (isCurrentUserDeputy) {
      return `${currentUser?.profile?.given_name}'s Files for Review`;
    } else {
      return `${currentUser?.profile?.given_name}'s Files`;
    }
  }, [isCurrentUserDeputy, currentUser?.profile?.given_name]);

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
          disabled={isSwitchDisabled}
        />
      }
      label={
        <Typography variant="body1" mr={1}>
          <strong>{getSwitchLabel}</strong>
        </Typography>
      }
      labelPlacement="start"
      sx={{
        marginRight: -1,
      }}
    />
  );
};

export default ShowOnlyMyRequirementsSwitch;
