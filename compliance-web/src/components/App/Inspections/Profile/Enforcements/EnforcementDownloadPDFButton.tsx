import { PictureAsPdfOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import { downloadFile } from "@/utils/appUtils";
import { useInspectionOrderRendered } from "@/hooks/useInspectionOrders";
import { EnforcementActionEnum } from "@/utils/constants";
import { useWarningLetterRendered } from "@/hooks/useInspectionWarningLetters";

interface EnforcementDownloadPDFButtonProps {
  enforcementId: number;
  fileNumber: string;
  enforcementType: EnforcementActionEnum;
}

const EnforcementDownloadPDFButton = ({
  enforcementId,
  fileNumber,
  enforcementType,
}: EnforcementDownloadPDFButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: mutateOrderPDFData } = useInspectionOrderRendered((data) => {
    downloadFile(data, `${fileNumber}.pdf`);
    setIsLoading(false);
  });

  const { mutate: mutateWarningLetterPDFData } = useWarningLetterRendered(
    (data) => {
      downloadFile(data, `${fileNumber}.pdf`);
      setIsLoading(false);
    }
  );

  const handleDownloadClick = () => {
    setIsLoading(true);
    if (enforcementType === EnforcementActionEnum.ORDER) {
      mutateOrderPDFData({
        inspectionOrderId: enforcementId,
        format: "pdf",
      });
    } else {
      mutateWarningLetterPDFData({
        inspectionWarningLetterId: enforcementId,
        format: "pdf",
      });
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
