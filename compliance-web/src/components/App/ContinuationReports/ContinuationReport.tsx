import ComingSoon from "@/components/Shared/ComingSoon";
import { Box } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useMenuStore } from "@/store/menuStore";

export default function ContinuationReport() {
  const { appHeaderHeight } = useMenuStore();

  return (
    <Box
      width={"40%"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
      height={`calc(100vh - ${appHeaderHeight + 158}px)`} // 158px is the height of the FileProfileHeader and the padding
    >
      <ComingSoon />
    </Box>
  );
}
