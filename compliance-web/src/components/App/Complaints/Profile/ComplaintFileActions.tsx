import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { useQueryClient } from "@tanstack/react-query";
import { Complaint } from "@/models/Complaint";
import { notify } from "@/store/snackbarStore";
import { useUpdateComplaintStatus } from "@/hooks/useComplaints";

interface ComplaintFileActionsProps {
  status: string;
  fileNumber: string;
}

const ComplaintFileActions: React.FC<ComplaintFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();

  const complaintData = queryClient.getQueryData<Complaint>([
    "complaint",
    fileNumber,
  ]);

  const onUpdateStatusSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["complaint", fileNumber],
    });
    notify.success("Complaint status updated");
    setClose();
  }, [fileNumber, queryClient, setClose]);

  const { mutate: updateComplaintStatus } = useUpdateComplaintStatus(
    onUpdateStatusSuccess
  );
  

  const actionsList = [
    {
      text: "Close Complaint",
      onClick: () => {
        // Handle closing complaint
        setOpen({
          content: (
            <ConfirmationModal
              title="Close Complaint?"
              description="Are you sure you want to close this complaint? This action cannot be undone without reopening the complaint."
              confirmButtonText="Close Complaint"
              onConfirm={() => {
                updateComplaintStatus({
                  id: complaintData?.id ?? 0,
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
      text: "Reopen Complaint",
      onClick: () => {
        // Handle reopening complaint
        setOpen({
          content: (
            <ConfirmationModal
              title="Reopen Complaint?"
              description="Are you sure you want to reopen this complaint?"
              confirmButtonText="Reopen Complaint"
              onConfirm={() => {
                updateComplaintStatus({
                  id: complaintData?.id ?? 0,
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
      text: "Delete Complaint",
      onClick: () => {
        // Handle deleting complaint
        setOpen({
          content: (
            <ConfirmationModal
              title="Delete Complaint?"
              description="You are about to delete this complaint. Are you sure?"
              confirmButtonText="Delete"
              onConfirm={() => {
                // TODO: Implement delete complaint
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

export default ComplaintFileActions;
