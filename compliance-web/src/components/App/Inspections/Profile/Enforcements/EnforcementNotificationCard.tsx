import { Close, InfoOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { useState } from "react";
import { EnforcementActionEnum } from "@/utils/constants";

const EnforcementNotificationCard = ({
  requirement,
}: {
  requirement: InspectionRequirement;
}) => {
  const [isClosed, setIsClosed] = useState(false);
  const enforcementType = requirement.enforcement_action_data.some(
    (enforcement) => enforcement.id === EnforcementActionEnum.ORDER
  )
    ? "Order"
    : "Warning Letter";

  return (
    !isClosed && (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          padding: "1rem 1.5rem",
          backgroundColor: BCDesignTokens.supportSurfaceColorInfo,
          borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
          border: "1px solid",
          borderColor: BCDesignTokens.supportBorderColorInfo,
          mb: 2,
        }}
      >
        <InfoOutlined sx={{ fontSize: "1.25rem", mt: 0.5 }} />
        <Box flexGrow={1}>
          <Typography variant="body1" fontWeight={"bold"}>
            {enforcementType}
          </Typography>
          <Typography variant="body1">
            You have selected {enforcementType} as an Enforcement Action for{" "}
            <strong>{requirement.summary}</strong>. Please proceed to create it.
          </Typography>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => {}}
            >
              Proceed
            </Button>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => {
            setIsClosed(true);
          }}
          sx={{ mt: -1, mr: -1 }}
        >
          <Close />
        </IconButton>
      </Box>
    )
  );
};

export default EnforcementNotificationCard;
