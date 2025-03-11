import { EditOutlined } from "@mui/icons-material";
import { Box, Typography, IconButton, SxProps } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

type IRBoxContainerProps = {
  title: string;
  onEdit: () => void;
  children?: React.ReactNode;
  sx?: SxProps;
};

const IRBoxContainer = ({ title, children, onEdit, sx }: IRBoxContainerProps) => {
  return (
    <Box
      aria-label={title}
      sx={{
        border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        borderRadius: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          height: 40,
          borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        }}
      >
        <Typography variant="body1">{title}</Typography>
        <IconButton
          size="small"
          color="secondary"
          onClick={onEdit}
          data-testid={`irbox-container-edit`}
        >
          <EditOutlined />
        </IconButton>
      </Box>
      <Box px={3} py={2}>
        {children}
      </Box>
    </Box>
  );
};

export default IRBoxContainer;
