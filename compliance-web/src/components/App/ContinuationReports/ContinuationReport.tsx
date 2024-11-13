import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
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
import { AppConfig } from "@/utils/config";
import ComingSoon from "@/components/Shared/ComingSoon";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    status,
    data: continuationReportData,
    isError,
    error,
    isLoading,
  } = useContinuationReportEntries(caseFileId, page, rowsPerPage);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({queryKey: ["continuation-reports", caseFileId]});
      setClose();
      notify.success(submitMsg);
    },
    [queryClient, caseFileId, setClose]
  );

  const handleAddNewEntry = useCallback(() => {
    setOpen({
      content: (
        <ContinuationReportEntryModal
          onSubmit={handleOnSubmit}
          context={{ caseFileId, contextType, contextId }}
        />
      ),
      width: "640px",
    });
  }, [setOpen, handleOnSubmit, caseFileId, contextType, contextId]);

  

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const handlerRowsPerPageChange = (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to the first page when rows per page changes
  };

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ["continuation-reports", caseFileId]});
  }, [queryClient, caseFileId, page, rowsPerPage]);

  const displayedRows = useMemo(() => {
    if (!continuationReportData) {
      return "0 - 0";
    }
    const start = rowsPerPage * (page - 1) + 1;
    const end = Math.min(rowsPerPage * page, continuationReportData.total);
    return `${start} - ${end}`;
  }, [continuationReportData, rowsPerPage, page]);

  return (
    <Box
      width={"40%"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
      height={`calc(100vh - ${appHeaderHeight + 198}px)`} // 158px is the height of the FileProfileHeader and the padding
      p={3}
      pb={2}
    >
      {AppConfig.inprogressFeatures?.includes("CONTINUATION_REPORT") ? (
        <ComingSoon />
      ) : (
        <>
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
          ) : continuationReportData.items.length ? (
            <>
              <Box
                sx={{
                  height: `calc(100vh - ${appHeaderHeight + 302 + 48}px)`, // 302px is the height above the timeline, 64px is height of pagination
                  overflow: "scroll",
                }}
              >
                <ContinuationReportTimeline
                  crtList={continuationReportData.items}
                />
              </Box>
              <Box display={"flex"} alignItems={"baseline"}>
                <Select
                  size="small"
                  value={rowsPerPage.toString()}
                  variant="outlined"
                  renderValue={() => displayedRows}
                  onChange={handlerRowsPerPageChange}
                  sx={{
                    backgroundColor: "transparent !important",
                    height: "2rem",
                    ".MuiSelect-icon": {
                      display: "none",
                    },
                    ".MuiOutlinedInput-input": {
                      paddingRight: "14px !important",
                      fontSize: "14px"
                    },
                  }}
                >
                  {[10, 20, 30].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option} per page
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="body2" mx={1}>
                  of {continuationReportData.total}
                </Typography>
                <Pagination
                  count={Math.ceil(continuationReportData.total / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  sx={{ paddingTop: "1rem" }}
                />
              </Box>
            </>
          ) : (
            <Typography variant="subtitle2" textAlign={"center"} mt={4}>
              -- No Records --
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
