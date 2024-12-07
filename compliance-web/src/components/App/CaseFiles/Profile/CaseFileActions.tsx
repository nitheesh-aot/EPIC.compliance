import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import {
  useDeleteCaseFile,
  useUpdateCaseFileStatus,
} from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import { useRouter } from "@tanstack/react-router";
import LinkCaseFileModal from "@/components/App/CaseFiles/Profile/LinkCaseFileModal";

interface CaseFileActionsProps {
  status: string;
  fileNumber: string;
}

const CaseFileActions: React.FC<CaseFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();

  const caseFileData = queryClient.getQueryData<CaseFile>([
    "case-file",
    fileNumber,
  ]);

  const onUpdateStatusSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["case-file", fileNumber],
    });
    notify.success("Case File status updated!");
    setClose();
  }, [queryClient, fileNumber, setClose]);

  const onDeleteSuccess = useCallback(() => {
    notify.success("Case File deleted!");
    setClose();
    router.navigate({ to: "/ce-database/case-files" });
  }, [setClose, router]);

  const { mutate: updateCaseFileStatus } = useUpdateCaseFileStatus(
    onUpdateStatusSuccess
  );
  const { mutate: deleteCaseFile } = useDeleteCaseFile(onDeleteSuccess);

  const actionsList = [
    {
      text: "Link to Case File",
      onClick: () => {
        // Handle linking case file
        setOpen({
          content: (
            <LinkCaseFileModal
              onSubmit={() => {
                // TODO: link case file
              }}
            />
          ),
        });
      },
      hidden: status?.toLowerCase() === "closed",
    },
    {
      text: "Unlink from Case File",
      onClick: () => {
        // Handle unlinking case file
        setOpen({
          content: (
            <LinkCaseFileModal
              onSubmit={() => {
                // TODO: link case file
              }}
            />
          ),
        });
      },
      hidden: status?.toLowerCase() === "closed",
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
              onConfirm={() => {
                updateCaseFileStatus({
                  id: caseFileData?.id ?? 0,
                  caseFileStatus: { status: "CLOSED" },
                });
              }}
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
        setOpen({
          content: (
            <ConfirmationModal
              title="Delete Case File?"
              description="You are about to delete this case file. Are you sure?"
              confirmButtonText="Delete"
              onConfirm={() => deleteCaseFile(caseFileData?.id ?? 0)}
            />
          ),
        });
      },
      hidden: false,
    },
  ];

  return <MenuActionDropdown actions={actionsList} />;
};

export default CaseFileActions;
