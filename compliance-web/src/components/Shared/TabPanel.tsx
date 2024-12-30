import { useMenuStore } from "@/store/menuStore";
import { Box } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id: string;
  width?: string;
  height?: string;
}

function TabPanel(props: TabPanelProps) {
  const { appHeaderHeight } = useMenuStore();
  const {
    children,
    value,
    index,
    id,
    width = "75%",
    height = `calc(100vh - ${appHeaderHeight + 198}px)`, // 198px is the height of the FileProfileHeader, 28px is the height of the TabPanel
    ...other
  } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`${id}-${index}`}
      aria-labelledby={`${id}-${index}`}
      {...other}
      width={width}
      height={height}
    >
      {value === index && children}
    </Box>
  );
}

export default TabPanel;
