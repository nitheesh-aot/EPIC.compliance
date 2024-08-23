import { useDrawer } from "@/store/drawerStore";
import { theme } from "@/styles/theme";
import {
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  ExpandMore,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { BCDesignTokens } from "epic.theme";

type CaseFileDrawerProps = {
  onSubmit: (submitMsg: string) => void;
};

const blockTitleStyles = {
  fontWeight: BCDesignTokens.typographyFontWeightsBold,
  color: BCDesignTokens.typographyColorPrimary,
  marginBottom: "1rem",
};
const CaseFileDrawer: React.FC<CaseFileDrawerProps> = ({ onSubmit }) => {
  const { setClose } = useDrawer();

  const handleClose = () => {
    setClose();
  };

  const handleSubmit = () => {
    onSubmit("submitted");
  };

  const testData = [
    { title: "The Shawshank Redemption", year: 1994 },
    { title: "The Godfather", year: 1972 },
    { title: "The Godfather: Part II", year: 1974 },
    { title: "The Dark Knight", year: 2008 },
    { title: "12 Angry Men", year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: "X3", year: 1993 },
  ];

  return (
    <Box width="718px">
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 2rem",
            borderBottom: "1px solid",
            borderColor: BCDesignTokens.supportBorderColorInfo,
          }}
        >
          <Typography variant="h6" color="primary">
            Create Case File Number
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: theme.palette.text.primary,
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Box
          sx={{
            backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
            padding: "0.75rem 2rem",
            textAlign: "right",
          }}
        >
          <Button variant={"contained"} type="submit">
            Create
          </Button>
        </Box>
        <Box padding={"0.75rem 2rem"}>
          <Typography variant="body2" sx={blockTitleStyles}>
            General Information
          </Typography>
          <Stack direction={"row"} gap={2}>
            <Autocomplete
              options={[]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label={"Project"} />
              )}
            />
            <DatePicker label="Date Created" sx={{ width: "100%" }} />
          </Stack>
          <Stack direction={"row"} gap={2}>
            <Autocomplete
              options={[]}
              fullWidth
              popupIcon={<ExpandMore />}
              renderInput={(params) => (
                <TextField {...params} label="Lead Officer (optional)" />
              )}
            />
            <Autocomplete
              options={testData}
              multiple
              limitTags={1}
              disableCloseOnSelect
              getOptionLabel={(option) => option.title}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlank />}
                      checkedIcon={<CheckBox />}
                      checked={selected}
                    />
                    {option.title}
                  </li>
                );
              }}
              fullWidth
              ChipProps={{
                deleteIcon: <Close />,
              }}
              renderInput={(params) => (
                <TextField {...params} label="Other Officers (optional)" />
              )}
            />
          </Stack>
          <Stack direction={"row"} gap={2}>
            <Autocomplete
              options={[]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Initiation" />
              )}
            />
            <TextField label="Case File Number" fullWidth />
          </Stack>
        </Box>
        <Box marginTop={"0.5rem"} paddingX={"2rem"}>
          <Typography variant="body2" sx={blockTitleStyles}>
            Inspection Records
          </Typography>
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              borderColor: BCDesignTokens.supportBorderColorInfo,
              backgroundColor: BCDesignTokens.supportSurfaceColorInfo,
              color: BCDesignTokens.typographyColorPrimary,
            }}
          >
            Once Inspections are created and linked, they will appear here
          </Alert>
        </Box>
      </form>
    </Box>
  );
};

export default CaseFileDrawer;
