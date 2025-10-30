import { downloadFile } from "@/utils/appUtils";
import {
  ArrowDropDownRounded,
  DownloadRounded,
  PictureAsPdfRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";
import {
  Button,
  ClickAwayListener,
  ButtonGroup,
  Grow,
  Paper,
  Popper,
  Typography,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useCreateDownloadRequest,
  useFetchIRReportDownload,
  useInspectionRecordRender,
} from "@/hooks/useInspectionReports";
import { useModal } from "@/store/modalStore";
import { useReportStore } from "./reportStore";
import ReportPreviewModal from "./ReportPreviewModal";
import { BCDesignTokens } from "epic.theme";
import {
  KC_USER_GROUPS,
  useCurrentLoggedInUser,
} from "@/hooks/useAuthorization";
import { useIsRolesAllowed } from "@/hooks/useAuthorization";
import {
  InspectionStatusEnum,
  IRReportDownloadStatus,
} from "@/utils/constants";
import { AxiosError } from "axios";
import { notify } from "@/store/snackbarStore";
import { useFetchPresignedGetURL } from "@/hooks/useImageUpload";
import dateUtils from "@/utils/dateUtils";
import { useQueryClient } from "@tanstack/react-query";
import { IRReportDownload } from "@/models/InspectionRecord";

const PreviewDownloadButton = () => {
  const queryClient = useQueryClient();
  const { setOpen: setModalOpen } = useModal();
  const { inspectionData, inspectionReportsData } = useReportStore();
  const [previewClicked, setPreviewClicked] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentLoggedInUser();

  const isSuperUser = useIsRolesAllowed([KC_USER_GROUPS.SUPERUSER]);

  const isUserPrimary = useMemo(
    () =>
      inspectionData?.primary_officer?.auth_user_guid ===
      currentUser?.preferred_username,
    [inspectionData?.primary_officer, currentUser?.preferred_username]
  );

  const isInspectionOpen = useMemo(
    () => inspectionData?.inspection_status === InspectionStatusEnum.OPEN,
    [inspectionData]
  );

  const isDownloadAllowed = useMemo(
    () => isInspectionOpen && (isUserPrimary || isSuperUser),
    [isInspectionOpen, isUserPrimary, isSuperUser]
  );

  const { data: irReportDownloadData } = useFetchIRReportDownload(
    inspectionData?.id ?? 0,
    inspectionReportsData?.id ?? 0
  );

  useEffect(() => {
    if (
      [
        IRReportDownloadStatus.NOT_STARTED,
        IRReportDownloadStatus.PENDING,
      ].includes(
        irReportDownloadData?.download_status?.id as IRReportDownloadStatus
      )
    ) {
      setDownloadInProgress(true);
    } else if (
      irReportDownloadData?.download_status?.id ===
      IRReportDownloadStatus.GENERATED
    ) {
      setDownloadInProgress(false);
    }
  }, [irReportDownloadData]);

  const onPreviewSuccess = (data: { html: string } | Blob) => {
    if ("html" in data) {
      setModalOpen({
        content: <ReportPreviewModal previewHtml={data.html ?? ""} />,
        width: "744px",
      });
    } else {
      downloadFile(data, `${inspectionData?.ir_number}.pdf`);
    }
    setPreviewClicked(false);
  };

  const onPreviewError = (error: AxiosError) => {
    notify.error(error.message ?? "Error processing report");
    setPreviewClicked(false);
  };

  const { mutate: mutateIrPreviewData } = useInspectionRecordRender(
    onPreviewSuccess,
    onPreviewError
  );

  const onSuccess = (data: IRReportDownload) => {
    queryClient.setQueryData(
      ["ir-report-download", inspectionData?.id, inspectionReportsData?.id],
      () => data
    );
    notify.success("Download request created successfully");
    setOpen(false);
  };

  const { mutate: mutateCreateDownloadRequest } =
    useCreateDownloadRequest(onSuccess);

  const handlePreviewClick = async () => {
    setPreviewClicked(true);
    mutateIrPreviewData({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      outputFormat: "html",
    });
  };

  // const handleDownloadClick = async (event: MouseEvent) => {
  //   setPreviewClicked(true);
  //   handleClose(event);
  //   mutateIrPreviewData({
  //     inspectionId: inspectionData?.id ?? 0,
  //     inspectionRecordId: inspectionReportsData?.id ?? 0,
  //     outputFormat: "pdf",
  //   });
  // };

  const handleGenerateReportClick = () => {
    mutateCreateDownloadRequest({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
    });
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const onPresignedUrlSuccess = (data: { presigned_url: string }) => {
    window.open(data.presigned_url, "_blank");
    setOpen(false);
  };

  const { mutate: mutateFetchPresignedGetURL } = useFetchPresignedGetURL(
    onPresignedUrlSuccess
  );

  const handleDownloadReportFromURL = () => {
    if (irReportDownloadData?.relative_url) {
      mutateFetchPresignedGetURL(irReportDownloadData.relative_url);
    }
  };

  return (
    <>
      <ButtonGroup
        variant="outlined"
        ref={anchorRef}
        aria-label="Button group for preview and download"
        sx={{
          "& .MuiButtonBase-root": {
            padding: "0.25rem 0.75rem",
            height: "38px",
            color: BCDesignTokens.typographyColorPrimary,
          },
        }}
      >
        <Button variant="contained" color="secondary" onClick={handlePreviewClick} disabled={previewClicked}>
          <PictureAsPdfRounded sx={{ mr: 1, fontSize: 20 }} />
          {previewClicked ? "Loading..." : "Preview"}
        </Button>
        {isDownloadAllowed && (
          <Button
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="download report"
            aria-haspopup="menu"
            variant="contained"
            color="secondary"
            onClick={handleToggle}
            sx={{
              padding: "0.5rem 0 !important",
              minWidth: "2rem !important",
            }}
          >
            <ArrowDropDownRounded />
          </Button>
        )}
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 2,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper elevation={3} sx={{ pt: 1, pb: 2 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                    <Button variant="text" onClick={handleGenerateReportClick} disabled={downloadInProgress} fullWidth sx={{ justifyContent: "flex-start" }}>
                      <AutoAwesomeRounded sx={{ mr: 1, fontSize: 20 }} />
                      {downloadInProgress ? "Generating report..." : "Generate Report as PDF"}
                      {downloadInProgress && (
                        <CircularProgress size={20} color="primary" sx={{ ml: 1 }} />
                      )}
                    </Button>
                    {irReportDownloadData?.download_status?.id ===
                      IRReportDownloadStatus.GENERATED &&
                      irReportDownloadData?.relative_url ? (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 1, width: "100%" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, pl: 2 }}>
                          <Typography variant="caption" color={BCDesignTokens.typographyColorPlaceholder}>
                            Last Generated:
                          </Typography>
                          <Typography variant="caption" color={BCDesignTokens.typographyColorPrimary}>
                            {dateUtils.formatDate(
                              irReportDownloadData?.generated_timestamp ?? "",
                              "MMM D, YYYY hh:mm A"
                            )}
                          </Typography>
                        </Box>
                        <Link onClick={handleDownloadReportFromURL} sx={{ display: "flex", alignItems: "flex-end", cursor: "pointer", pr: 2, fontSize: 14 }}>
                          <DownloadRounded sx={{ mr: 0.5, fontSize: 16 }} />
                          Download
                        </Link>
                      </Box>
                    ) : (
                      <Typography variant="caption" px={2}>
                        Nothing generated yet.
                      </Typography>
                    )}
                  </Box>
                </>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper >
    </>
  );
};

export default PreviewDownloadButton;
