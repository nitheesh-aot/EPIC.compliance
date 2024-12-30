import LinkCaseFileModal from "@/components/App/CaseFiles/Profile/LinkCaseFileModal";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import {
  useDeleteCaseFile,
  useLinkCaseFile,
  useUnlinkCaseFile,
  useUpdateCaseFileStatus,
} from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import React, { useCallback } from "react";

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

  const closeAndRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["case-file", fileNumber],
    });
    queryClient.invalidateQueries({
      queryKey: ["continuation-reports", caseFileData?.id],
    });
    setClose();
  }, [caseFileData, fileNumber, queryClient, setClose]);

  const onUpdateStatusSuccess = useCallback(() => {
    notify.success("Case File status updated!");
    closeAndRefresh();
  }, [closeAndRefresh]);

  const onLinkCaseFileSuccess = useCallback(() => {
    notify.success("Case file link is updated");
    closeAndRefresh();
  }, [closeAndRefresh]);

  const onDeleteSuccess = useCallback(() => {
    notify.success("Case File deleted!");
    setClose();
    router.navigate({ to: "/ce-database/case-files" });
  }, [setClose, router]);

  const { mutate: linkCaseFile } = useLinkCaseFile(onLinkCaseFileSuccess);
  const { mutate: unlinkCaseFile } = useUnlinkCaseFile(onLinkCaseFileSuccess);
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
              fileNumber={fileNumber}
              linkedCaseFiles={caseFileData?.caseFileLinks ?? []}
              onSubmit={(caseFileId) => {
                linkCaseFile({ id: caseFileData?.id ?? 0, linkId: caseFileId });
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
              fileNumber={fileNumber}
              onSubmit={(caseFileId) => {
                unlinkCaseFile({
                  id: caseFileData?.id ?? 0,
                  linkId: caseFileId,
                });
              }}
              linkedCaseFiles={caseFileData?.caseFileLinks ?? []}
              isEdit
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
        setOpen({
          content: (
            <ConfirmationModal
              title="Reopen Case File?"
              description="You are about to reopen this case file. Are you sure?"
              confirmButtonText="Reopen Case File"
              onConfirm={() => {
                updateCaseFileStatus({
                  id: caseFileData?.id ?? 0,
                  caseFileStatus: { status: "OPEN" },
                });
              }}
            />
          ),
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
