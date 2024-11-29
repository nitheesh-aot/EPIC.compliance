import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ComplaintDrawer from "@/components/App/Complaints/ComplaintDrawer";
import { useDrawer } from "@/store/drawerStore";
import { CaseFile } from "@/models/CaseFile";

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
      width: "1118px",
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
