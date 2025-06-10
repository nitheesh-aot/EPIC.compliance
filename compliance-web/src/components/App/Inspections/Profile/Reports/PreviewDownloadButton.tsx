import { downloadFile } from "@/utils/appUtils";
import { ArrowDropDownRounded, DownloadRounded, PictureAsPdfOutlined } from "@mui/icons-material";
import {
  Button,
  ClickAwayListener,
  ButtonGroup,
  Grow,
  Paper,
  Popper,
  MenuList,
  MenuItem,
} from "@mui/material";
import { useRef, useState } from "react";
import { useInspectionRecordRender } from "@/hooks/useInspectionReports";
import { useModal } from "@/store/modalStore";
import { useReportStore } from "./reportStore";
import ReportPreviewModal from "./ReportPreviewModal";
import { notify } from "@/store/snackbarStore";
import { BCDesignTokens } from "epic.theme";

const PreviewDownloadButton = () => {
  const { setOpen: setModalOpen } = useModal();
  const { inspectionData, inspectionReportsData } = useReportStore();
  const [previewClicked, setPreviewClicked] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const { refetch: refetchIrPreviewData } = useInspectionRecordRender(
    inspectionData?.id ?? 0,
    inspectionReportsData?.id ?? 0,
    "html",
    false
  );

  const { refetch: refetchIrPDFData } = useInspectionRecordRender(
    inspectionData?.id ?? 0,
    inspectionReportsData?.id ?? 0,
    "pdf",
    false
  );

  const handlePreviewClick = async () => {
    setPreviewClicked(true);
    try {
      const result = await refetchIrPreviewData();
      setPreviewClicked(false);
      if (result.data) {
        // Handle HTML preview
        const html = result.data.html ?? "";
        setModalOpen({
          content: <ReportPreviewModal previewHtml={html} />,
          width: "660px",
        });
      }
    } catch (error) {
      notify.error("Failed to generate PDF preview");
      setPreviewClicked(false);
    }
  };

  const handleDownloadClick = async (event: MouseEvent) => {
    setPreviewClicked(true);
    handleClose(event);
    try {
      const result = await refetchIrPDFData();
      setPreviewClicked(false);
      if (result.data) {
        downloadFile(
          result.data,
          `${inspectionData?.ir_number}.pdf`
        );
      }
    } catch (error) {
      notify.error("Failed to generate PDF preview");
      setPreviewClicked(false);
    }
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
        <Button onClick={handlePreviewClick} disabled={previewClicked}>
          <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
          {previewClicked ? "Loading..." : "Preview"}
        </Button>
        <Button
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="download report"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{
            padding: "0.5rem 0 !important",
            minWidth: "2rem !important",
          }}
        >
          <ArrowDropDownRounded />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
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
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  <MenuItem
                    key="download-report-as-pdf"
                    onClick={(e) =>
                      handleDownloadClick(e as unknown as MouseEvent)
                    }
                    disabled={previewClicked}
                    component="button"
                  >
                    <DownloadRounded sx={{ mr: 1, fontSize: 20 }} />
                    {previewClicked
                      ? "Downloading..."
                      : "Download Report as PDF"}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default PreviewDownloadButton;
