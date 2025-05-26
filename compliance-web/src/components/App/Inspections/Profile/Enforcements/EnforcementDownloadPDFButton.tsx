import { PictureAsPdfOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import { notify } from "@/store/snackbarStore";
import { downloadFile } from "@/utils/appUtils";
import { useInspectionOrderRendered } from "@/hooks/useInspectionOrders";
import { EnforcementActionEnum } from "@/utils/constants";
import { useInspectionWarningLetterRendered } from "@/hooks/useInspectionWarningLetters";
import { useModal } from "@/store/modalStore";
import ReportPreviewModal from "../Reports/ReportPreviewModal";

interface EnforcementDownloadPDFButtonProps {
  inspectionId: number;
  enforcementId: number;
  fileNumber: string;
  enforcementType: EnforcementActionEnum;
}

const EnforcementDownloadPDFButton = ({
  inspectionId,
  enforcementId,
  fileNumber,
  enforcementType,
}: EnforcementDownloadPDFButtonProps) => {
  const { setOpen: setModalOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const { refetch: refetchOrderPDFData } = useInspectionOrderRendered(
    inspectionId,
    enforcementId,
    "pdf",
    false
  );

  const { refetch: refetchWarningLetterPDFData } =
    useInspectionWarningLetterRendered(
      inspectionId,
      enforcementId,
      "pdf",
      false
    );

  const handleDownloadClick = async () => {
    setIsLoading(true);
    try {
      const result =
        enforcementType === EnforcementActionEnum.ORDER
          ? await refetchOrderPDFData()
          : await refetchWarningLetterPDFData();
      if (result.data) {
        downloadFile(result.data, `${fileNumber}-${Date.now()}.pdf`);
      }
    } catch (error) {
      notify.error("Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewClick = async () => {
    try {
      const result =
        enforcementType === EnforcementActionEnum.ORDER
          ? await refetchOrderPDFData()
          : await refetchWarningLetterPDFData();
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
    }
  };

  return (
    <Button variant="text" onClick={handleDownloadClick} disabled={isLoading}>
      <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
      {isLoading ? "Loading..." : "Download PDF"}
    </Button>
  );
};

export default EnforcementDownloadPDFButton;
