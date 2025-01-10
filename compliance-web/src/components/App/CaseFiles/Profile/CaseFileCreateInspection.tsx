import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { CaseFile } from "@/models/CaseFile";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const CaseFileCreateInspection = ({
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
        queryKey: ["inspections-by-caseFileId", caseFileData?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["continuation-reports", caseFileData?.id],
      })
      setClose();
      notify.success(submitMsg);
    },
    [queryClient, setClose, caseFileData]
  );

  const handleOpenInspectionDrawer = useCallback(() => {
    setOpen({
      content: (
        <InspectionDrawer
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
      onClick={handleOpenInspectionDrawer}
      startIcon={<AddRounded />}
      disabled={disabled}
    >
      Inspection
    </Button>
  );
};

export default CaseFileCreateInspection;
