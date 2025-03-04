import { Box, Button, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { components, MenuProps } from "react-select";

const Menu = (props: MenuProps) => {
  const { filterProps  } = props.selectProps;
  return (
    <>
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          borderRadius: "4px",
          background: BCDesignTokens.surfaceColorBackgroundWhite,
          minWidth: "100%",
        }}
      >
        <components.Menu {...props}>
          {props.isMulti && props.options.length > 5 && (
            <Box
              sx={{
                display: "flex",
                padding: ".5rem 1rem",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "space-between",
                background: BCDesignTokens.surfaceColorBackgroundLightGray,
                borderTopLeftRadius: "4px",
                borderTopRightRadius: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {filterProps?.selectedOptions && (
                <Typography variant="body1">
                  {filterProps?.selectedOptions.length} selected
                </Typography>
              )}
              <Button variant="text" onClick={filterProps?.clearFilters}>
                Clear Filters
              </Button>
            </Box>
          )}
          <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {props.children}
          </Box>
          <Box
            sx={{
              display: "flex",
              padding: "1rem",
              alignItems: "flex-start",
              gap: "1rem",
              justifyContent: "space-between",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
            }}
          >
            <Button
              variant="outlined"
              onClick={filterProps?.onCancel}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={filterProps?.applyFilters}
              fullWidth
            >
              Apply
            </Button>
          </Box>
        </components.Menu>
      </Box>
    </>
  );
};

export default Menu;
