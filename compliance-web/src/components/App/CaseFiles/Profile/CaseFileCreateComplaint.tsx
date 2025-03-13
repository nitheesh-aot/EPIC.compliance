import ComplaintDrawer from "@/components/App/Complaints/ComplaintDrawer";
import { CaseFile } from "@/models/CaseFile";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { DRAWER_WIDTHS } from "@/utils/constants";
import { AddRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const CaseFileCreateComplaint = ({
  fileNumber,
  disabled = false,
}: {
  fileNumber: string;
  disabled?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useDrawer();

  const caseFileData = queryClient.getQueryData<CaseFile>([
    "case-file",
    fileNumber,
  ]);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({
        queryKey: ["complaints-by-caseFileId", caseFileData?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["continuation-reports", caseFileData?.id],
      })
      setClose();
      notify.success(submitMsg);
    },
    [caseFileData, queryClient, setClose]
  );

  const handleOpenComplaintDrawer = useCallback(() => {
    setOpen({
      content: (
        <ComplaintDrawer
          onSubmit={handleOnSubmit}
          caseFile={caseFileData as CaseFile}
        />
      ),
      width: DRAWER_WIDTHS.COMPLAINT_DRAWER,
    });
  }, [setOpen, handleOnSubmit, caseFileData]);

  return (
    <Button
      variant="text"
      size="small"
      onClick={handleOpenComplaintDrawer}
      startIcon={<AddRounded />}
      disabled={disabled}
    >
      Complaint
    </Button>
  );
};

export default CaseFileCreateComplaint;
