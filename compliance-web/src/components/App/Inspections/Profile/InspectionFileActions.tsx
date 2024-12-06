import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { useQueryClient } from "@tanstack/react-query";
import { Inspection } from "@/models/Inspection";
import { useCloseInspection } from "@/hooks/useInspections";
import { notify } from "@/store/snackbarStore";

interface InspectionFileActionsProps {
  status: string;
  fileNumber: string;
}

const InspectionFileActions: React.FC<InspectionFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();

  const inspectionData = queryClient.getQueryData<Inspection>([
    "inspection",
    fileNumber,
  ]);

  const onUpdateStatusSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["inspection", fileNumber],
    });
    notify.success("Inspection status updated");
    setClose();
  }, [fileNumber, queryClient, setClose]);

  const { mutate: closeInspection } = useCloseInspection(
    onUpdateStatusSuccess
  );

  const actionsList = [
    {
      text: "Cancel Inspection",
      onClick: () => {
        // Handle canceling inspection
        setOpen({
          content: (
            <ConfirmationModal
              title="Cancel Inspection?"
              description="Are you sure you want to cancel this inspection?"
              confirmButtonText="Cancel Inspection"
              onConfirm={() => {
                // TODO: Implement cancel inspection
                setClose();
              }}
            />
          ),
        });
      },
      hidden: status?.toLowerCase() === "closed",
    },
    {
      text: "Close as Note to File",
      onClick: () => {
        // Handle closing inspection
        setOpen({
          content: (
            <ConfirmationModal
              title="Close Inspection as Note to File?"
              description="Are you sure you want to close inspection as note to file?"
              confirmButtonText="Close Inspection"
              onConfirm={() => {
                closeInspection({ id: inspectionData?.id ?? 0 });
              }}
            />
          ),
          width: "420px",
        });
      },
      hidden: status?.toLowerCase() === "closed",
    },
    {
      text: "Reopen Inspection",
      onClick: () => {
        // Handle reopening inspection
        setOpen({
          content: (
            <ConfirmationModal
              title="Reopen Inspection?"
              description="Are you sure you want to reopen this inspection?"
              confirmButtonText="Reopen Inspection"
              onConfirm={() => {
                // TODO: Implement reopen inspection
                setClose();
              }}
            />
          ),
        });
      },
      hidden: status?.toLowerCase() === "open",
    },
    {
      text: "Delete Inspection",
      onClick: () => {
        // Handle deleting inspection
        setOpen({
          content: (
            <ConfirmationModal
              title="Delete Inspection?"
              description="You are about to delete this inspection. Are you sure?"
              confirmButtonText="Delete"
              onConfirm={() => {
                // TODO: Implement delete inspection
                setClose();
              }}
            />
          ),
        });
      },
      hidden: false,
    },
  ];

  return <MenuActionDropdown actions={actionsList} />;
};

export default InspectionFileActions;
