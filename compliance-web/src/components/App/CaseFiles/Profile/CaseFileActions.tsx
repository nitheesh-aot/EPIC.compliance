import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import { useUpdateCaseFileStatus } from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";

interface CaseFileActionsProps {
  status: string;
  fileNumber: string;
}

const CaseFileActions: React.FC<CaseFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();

  const caseFileData = queryClient.getQueryData<CaseFile>([
    "case-file",
    fileNumber,
  ]);

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["case-file", fileNumber],
    });
    notify.success("Case File status updated!");
    setClose();
  }, [queryClient, fileNumber, setClose]);

  const { mutate: updateCaseFileStatus } = useUpdateCaseFileStatus(onSuccess);

  const handleConfirmCloseReopen = useCallback(
    (status: string) => {
      updateCaseFileStatus({
        id: caseFileData?.id ?? 0,
        caseFileStatus: { status },
      });
    },
    [updateCaseFileStatus, caseFileData]
  );

  const actionsList = [
    {
      text: "Link to Case File",
      onClick: () => {
        // Handle linking case file
      },
      hidden: true,
    },
    {
      text: "Unlink from Case File",
      onClick: () => {
        // Handle unlinking case file
      },
      hidden: true,
    },
    {
      text: "Close Case File",
      onClick: () => {
        // Handle closing case file
        setOpen({
          content: (
            <ConfirmationModal
              title="Close Case File?"
              description="Are you sure you want to close this case file? This action cannot be undone without reopening the case file."
              confirmButtonText="Close Case File"
              onConfirm={() => handleConfirmCloseReopen("CLOSED")}
            />
          ),
        });
      },
      hidden: status?.toLowerCase() === "closed",
    },
    {
      text: "Reopen Case File",
      onClick: () => {
        // Handle reopening case file
        updateCaseFileStatus({
          id: caseFileData?.id ?? 0,
          caseFileStatus: { status: "OPEN" },
        });
      },
      hidden: status?.toLowerCase() === "open",
    },
    {
      text: "Delete Case File",
      onClick: () => {
        // Handle deleting case file
        updateCaseFileStatus({
          id: caseFileData?.id ?? 0,
          caseFileStatus: { status: "DELETE" },
        });
      },
      hidden: false,
    },
  ];

  return <MenuActionDropdown actions={actionsList} />;
};

export default CaseFileActions;
