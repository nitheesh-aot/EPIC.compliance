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
import { useContinuationReportEntries } from "@/hooks/useContinuationReports";
import LoadingPage from "@/components/Shared/LoadingPage";
import ErrorPage from "@/components/Shared/ErrorPage";
import { useQueryClient } from "@tanstack/react-query";

export type ContinuationReportContextType = {
  caseFileId: number;
  contextType: string;
  contextId: number;
};

export default function ContinuationReport({
  caseFileId,
  contextType,
  contextId,
}: ContinuationReportContextType) {
  const queryClient = useQueryClient();
  const { appHeaderHeight } = useMenuStore();
  const { setOpen, setClose } = useModal();

  const {
    status,
    data: continuationReportData,
    isError,
    error,
    isLoading,
  } = useContinuationReportEntries(caseFileId);

  const handleAddNewEntry = () => {
    setOpen({
      content: (
        <ContinuationReportEntryModal
          onSubmit={handleOnSubmit}
          context={{ caseFileId, contextType, contextId }}
        />
      ),
      width: "640px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({
      queryKey: ["continuation-reports", caseFileId],
    });
    setClose();
    notify.success(submitMsg);
  };

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
      {!caseFileId || status === "pending" ? (
        <LoadingPage isLoading={isLoading} />
      ) : isError ? (
        <ErrorPage error={error} hideBackButton />
      ) : continuationReportData.length ? (
        <ContinuationReportTimeline crtList={continuationReportData} />
      ) : (
        <Typography variant="subtitle2" textAlign={"center"} mt={4}>-- No Records --</Typography>
      )}
    </Box>
  );
}
