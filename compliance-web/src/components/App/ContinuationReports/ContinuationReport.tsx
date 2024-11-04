import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useMenuStore } from "@/store/menuStore";
import { AddRounded, SearchRounded } from "@mui/icons-material";
import ContinuationReportTimeline from "./ContinuationReportTimeline";
import { useModal } from "@/store/modalStore";
import ContinuationReportEntryModal from "./ContinuationReportEntryModal";
import { notify } from "@/store/snackbarStore";

export default function ContinuationReport() {
  const { appHeaderHeight } = useMenuStore();
  const { setOpen, setClose } = useModal();

  const handleAddNewEntry = () => {
    setOpen({
      content: <ContinuationReportEntryModal onSubmit={handleOnSubmit} />,
      width: "640px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    // queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    setClose();
    notify.success(submitMsg);
  };

  const dummyCRTimeline = [
    {
      date: "2024-09-31T08:48:38.311Z",
      text: "BRUCEJ_20240007_IR001 is created.",
    },
    {
      date: "2024-10-28T23:28:11.311Z",
      text: "<New entry added with rich text info>",
    },
    {
      date: "2024-10-31T18:45:21.311Z",
      text: "20240007 is created.",
    },
  ];

  return (
    <Box
      width={"40%"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
      height={`calc(100vh - ${appHeaderHeight + 198}px)`} // 158px is the height of the FileProfileHeader and the padding
      p={3}
      pb={2}
    >
      <Box display={"flex"} justifyContent={"space-between"} mb={2}>
        <Typography variant="h6">Continuation Report</Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={handleAddNewEntry}
          startIcon={<AddRounded />}
        >
          New Entry
        </Button>
      </Box>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchRounded />
            </InputAdornment>
          ),
        }}
      />
      <ContinuationReportTimeline crtList={dummyCRTimeline} />
    </Box>
  );
}
