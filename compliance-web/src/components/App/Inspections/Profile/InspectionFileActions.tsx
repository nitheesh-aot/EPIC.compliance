import MenuActionDropdown from "@/components/Shared/MenuActionDropdown";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import {
  useDeleteInspection,
  useUpdateInspectionStatus,
} from "@/hooks/useInspections";
import { Inspection } from "@/models/Inspection";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import React, { useCallback } from "react";

interface InspectionFileActionsProps {
  status: string;
  fileNumber: string;
}

const InspectionFileActions: React.FC<InspectionFileActionsProps> = ({
  status,
  fileNumber,
}) => {
  const router = useRouter();
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
    queryClient.invalidateQueries({
      queryKey: ["continuation-reports", inspectionData?.case_file_id],
    });
    notify.success("Inspection status updated");
    setClose();
  }, [fileNumber, inspectionData, queryClient, setClose]);

  const onDeleteSuccess = useCallback(() => {
    notify.success("Inspection deleted!");
    setClose();
    router.navigate({ to: "/ce-database/inspections" });
  }, [router, setClose]);

  const { mutate: updateInspectionInspection } = useUpdateInspectionStatus(
    onUpdateStatusSuccess
  );

  const { mutate: deleteInspection } = useDeleteInspection(onDeleteSuccess);

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
      hidden: ["canceled", "closed", "closed as note"].includes(status?.toLowerCase()),
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
                  inspectionStatus: { status: "CLOSED_AS_NOTE" },
                });
              }}
            />
          ),
          width: "420px",
        });
      },
      hidden: ["canceled", "closed as note", "closed"].includes(status?.toLowerCase()),
    },
    {
      text: "Closed",
      onClick: () => {
        // Handle closing inspection
        setOpen({
          content: (
            <ConfirmationModal
              title="Close Inspectio?"
              description="Are you sure you want to close inspection?"
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
      hidden: ["canceled", "closed", "closed as note"].includes(status?.toLowerCase()),
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
                deleteInspection(inspectionData?.id ?? 0);
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
