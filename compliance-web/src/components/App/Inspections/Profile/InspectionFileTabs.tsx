import { useTab } from "@/store/tabStore";
import { Box, Tab, Tabs } from "@mui/material";
import { BCDesignTokens } from "epic.theme";

interface InspectionFileTabsProps {}

const InspectionFileTabs: React.FC<InspectionFileTabsProps> = () => {
  const { currentTab, setCurrentTab } = useTab();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabStyle = {
    minWidth: "auto",
    minHeight: "36px",
    padding: "0.5rem 0",
    fontSize: BCDesignTokens.typographyFontSizeSmallBody,
  };

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        sx={{
          minHeight: "36px",
          marginTop: "-0.5rem",
          paddingLeft: "3.75rem",
          "& .MuiTabs-flexContainer": {
            gap: "1rem",
          },
        }}
      >
        <Tab label="Details" sx={tabStyle} />
        <Tab label="Requirements" sx={tabStyle} />
        <Tab label="Enforcement" sx={tabStyle} />
        <Tab label="Report" sx={tabStyle} />
      </Tabs>
    </Box>
  );
};

export default InspectionFileTabs;
