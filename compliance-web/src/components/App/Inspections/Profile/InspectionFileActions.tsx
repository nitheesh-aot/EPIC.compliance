import React, { useCallback } from "react";
import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useModal } from "@/store/modalStore";
import { useQueryClient } from "@tanstack/react-query";
import { Inspection } from "@/models/Inspection";
import { notify } from "@/store/snackbarStore";
import { useUpdateInspectionStatus } from "@/hooks/useInspections";

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

  const { mutate: updateInspectionInspection } = useUpdateInspectionStatus(
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
                updateInspectionInspection({
                  id: inspectionData?.id ?? 0,
                  inspectionStatus: { status: "CANCELED" },
                });
              }}
            />
          ),
        });
      },
      hidden: ["canceled", "closed"].includes(status?.toLowerCase()),
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
                updateInspectionInspection({
                  id: inspectionData?.id ?? 0,
                  inspectionStatus: { status: "CLOSED" },
                });
              }}
            />
          ),
          width: "420px",
        });
      },
      hidden: ["canceled", "closed"].includes(status?.toLowerCase()),
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
