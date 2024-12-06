import React from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";

interface ComplaintFileActionsProps {
  status: string;
  fileNumber: string;
}

const ComplaintFileActions: React.FC<ComplaintFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const { setOpen, setClose } = useModal();

  const actionsList = [
    {
      text: "Close Complaint",
      onClick: () => {
        // eslint-disable-next-line no-console
        console.log("close complaint ", fileNumber);
        // Handle closing complaint
        setOpen({
          content: (
            <ConfirmationModal
              title="Close Complaint?"
              description="Are you sure you want to close this complaint? This action cannot be undone without reopening the complaint."
              confirmButtonText="Close Complaint"
              onConfirm={() => {
                // TODO: Implement close complaint
                setClose()
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
                // TODO: Implement reopen complaint
                setClose();
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
