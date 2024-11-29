import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import { useUpdateCaseFileStatus } from "@/hooks/useCaseFiles";
import { CaseFile } from "@/models/CaseFile";
import { useQueryClient } from "@tanstack/react-query";

interface CaseFileActionsProps {
  status: string;
  fileNumber: string;
}

const CaseFileActions: React.FC<CaseFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const queryClient = useQueryClient();

  const caseFileData = queryClient.getQueryData<CaseFile>([
    "case-file",
    fileNumber,
  ]);

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["case-file", fileNumber],
    });
  }, [queryClient, fileNumber]);

  const { mutate: updateCaseFileStatus } = useUpdateCaseFileStatus(onSuccess);

  const actionsList = [
    {
      text: "Link to Case File",
      onClick: () => {
        // Handle linking case file
      },
      hidden: false,
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
        updateCaseFileStatus({
          id: caseFileData?.id ?? 0,
          caseFileStatus: { status: "CLOSED" },
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
