import { downloadFile } from "@/utils/appUtils";
import { PictureAsPdfOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import { useInspectionRecordRender } from "@/hooks/useInspectionReports";
import { useModal } from "@/store/modalStore";
import { useReportStore } from "./reportStore";
import ReportPreviewModal from "./ReportPreviewModal";
import { notify } from "@/store/snackbarStore";

const PreviewDownloadButton = () => {
  const { setOpen } = useModal();
  const { inspectionData, inspectionReportsData } = useReportStore();
  const [previewClicked, setPreviewClicked] = useState(false);

  const { refetch: refetchIrRenderData } = useInspectionRecordRender(
    inspectionData?.id ?? 0,
    inspectionReportsData?.id ?? 0,
    "pdf",
    false
  );

  const handlePreviewClick = async () => {
    setPreviewClicked(true);
    try {
      const result = await refetchIrRenderData();
      if (result.data) {
        setPreviewClicked(false);

        if (result.data.html) {
          // Handle HTML preview
          const html = result.data.html ?? "";
          setOpen({
            content: <ReportPreviewModal previewHtml={html} />,
            width: "660px",
          });
        } else {
          // The result.data is a Blob because the responseType is 'blob'
          downloadFile(
            result.data,
            `IR-${inspectionData?.ir_number || "inspection"}-${Date.now()}.pdf`
          );
        }
      }
    } catch (error) {
      notify.error("Failed to generate PDF preview");
      setPreviewClicked(false);
    }
  };

  return (
    <Button
      variant="text"
      color="primary"
      onClick={handlePreviewClick}
      disabled={previewClicked}
    >
      <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
      {previewClicked ? "Loading..." : "Preview"}
    </Button>
  );
};

export default PreviewDownloadButton;
