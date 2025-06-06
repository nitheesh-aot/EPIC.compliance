import { useStaffUsersData } from "@/hooks/useStaff";
import { SendRounded } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { SendForApprovalFormType } from "../SendForApprovalModal";
import { useCallback, useMemo } from "react";
import SendForApprovalModal from "../SendForApprovalModal";
import { notify } from "@/store/snackbarStore";
import { useModal } from "@/store/modalStore";
import {
  useCreateOrderApproval,
  useFetchOrderApprovals,
  useUpdateOrderApprovalStatus,
} from "@/hooks/useInspectionOrders";
import { StaffUser } from "@/models/Staff";
import { OrderApproval } from "@/models/OrderApproval";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { APPROVAL_STATUS, STAFF_USER_POSITION } from "@/utils/constants";
import { OrderProgressEnum } from "@/utils/constants";
import { InspectionOrder } from "@/models/InspectionOrder";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import IssueEnforcementModal from "./IssueEnforcementModal";
import { useDrawer } from "@/store/drawerStore";

const OrderApprovalButtons = ({
  inspectionOrder,
  inspectionId,
}: {
  inspectionOrder: InspectionOrder;
  inspectionId: number;
}) => {
  const { setOpen, setClose } = useModal();
  const { setClose: setDrawerClose } = useDrawer();
  const { data: staffData } = useStaffUsersData();
  const currentUser = useCurrentLoggedInUser();
  const queryClient = useQueryClient();

  const { data: orderApprovalsData } = useFetchOrderApprovals(
    inspectionOrder.id ?? 0
  );

  // Memoize the current user's staff ID
  const currentUserStaffId = useMemo(
    () =>
      staffData?.find(
        (staff) => staff.auth_user_guid === currentUser?.preferred_username
      )?.id ?? 0,
    [staffData, currentUser]
  );

  // Check if current user is an approver (director or deputy director)
  const isCurrentUserApprover = useMemo(() => {
    return staffData?.some(
      (staff) =>
        staff.auth_user_guid === currentUser?.preferred_username &&
        [
          STAFF_USER_POSITION.DEPUTY_DIRECTOR,
          STAFF_USER_POSITION.DIRECTOR,
        ].includes(staff.position_id ?? 0)
    );
  }, [staffData, currentUser]);

  const refetchDataAndClose = useCallback(
    (message: string) => {
      notify.success(message);
      queryClient.invalidateQueries({
        queryKey: ["inspection-orders", inspectionId],
      });
      setClose();
      setDrawerClose();
    },
    [queryClient, inspectionId, setClose, setDrawerClose]
  );

  const onSuccess = useCallback(
    (data: OrderApproval) => {
      queryClient.setQueryData(
        ["order-approvals", inspectionOrder.id],
        (oldData: OrderApproval[]) => {
          return [...oldData, data];
        }
      );
      refetchDataAndClose("Approval request sent");
    },
    [refetchDataAndClose, queryClient, inspectionOrder.id]
  );

  const { mutate: createOrderApproval, isPending } =
    useCreateOrderApproval(onSuccess);

  const onApprovalSuccess = useCallback(
    (data: OrderApproval) => {
      notify.success("Approval status updated");
      queryClient.setQueryData(
        ["order-approvals", inspectionOrder.id],
        (oldData: OrderApproval[]) => {
          return oldData.map((approval) =>
            approval.id === data.id ? data : approval
          );
        }
      );
      refetchDataAndClose("Approval status updated");
    },
    [inspectionOrder.id, queryClient, refetchDataAndClose]
  );

  const { mutate: updateOrderApprovalStatus } =
    useUpdateOrderApprovalStatus(onApprovalSuccess);

  const onSendForApprovalSubmitHandler = useCallback(
    (data: SendForApprovalFormType) => {
      const directorId = (data.director as StaffUser).id;
      createOrderApproval({
        inspectionOrderId: inspectionOrder.id ?? 0,
        approvalPayload: {
          approved_by_id: directorId,
        },
      });
    },
    [createOrderApproval, inspectionOrder.id]
  );

  // Modal handlers
  const handleSendForApproval = useCallback(() => {
    setOpen({
      content: (
        <SendForApprovalModal
          staffUsers={staffData ?? []}
          onSubmitHandler={onSendForApprovalSubmitHandler}
          isPending={isPending}
        />
      ),
    });
  }, [setOpen, staffData, onSendForApprovalSubmitHandler, isPending]);

  const isInDeputyReview = useMemo(
    () =>
      inspectionOrder.order_progress?.id === OrderProgressEnum.DEPUTY_REVIEW,
    [inspectionOrder.order_progress]
  );

  const isInDrafting = useMemo(
    () => inspectionOrder.order_progress?.id === OrderProgressEnum.DRAFTING,
    [inspectionOrder.order_progress]
  );

  const isDisableSendApprovalButton = useMemo(
    () => isInDeputyReview && !isCurrentUserApprover,
    [isInDeputyReview, isCurrentUserApprover]
  );

  const isShowSendForApprovalButton = useMemo(
    () => isInDrafting || isDisableSendApprovalButton,
    [isInDrafting, isDisableSendApprovalButton]
  );

  const isShowApprovalButtons = useMemo(
    () => isInDeputyReview && isCurrentUserApprover,
    [isInDeputyReview, isCurrentUserApprover]
  );

  const isShowIssueButton = useMemo(
    () =>
      inspectionOrder?.order_progress?.id === OrderProgressEnum.APPROVED &&
      inspectionOrder?.intended_issuance_date,
    [inspectionOrder]
  );

  const handleApprovalsButtonClick = useCallback(
    (isApprove: boolean) => {
      setOpen({
        content: (
          <ConfirmationModal
            title={`${isApprove ? "Approve" : "Reject"} Order?`}
            description={`You are about to ${isApprove ? "approve" : "reject"} this Order. ${
              !isApprove
                ? "This action will return the Order to the officer for further review and revision. "
                : ""
            }Are you sure?`}
            confirmButtonText={isApprove ? "Approve" : "Reject"}
            onConfirm={() => {
              updateOrderApprovalStatus({
                inspectionOrderId: inspectionOrder.id ?? 0,
                approvalId: orderApprovalsData?.[0]?.id ?? 0,
                statusPayload: {
                  approval_status: isApprove
                    ? APPROVAL_STATUS.APPROVED
                    : APPROVAL_STATUS.NOT_APPROVED,
                  approved_by_id: currentUserStaffId,
                },
              });
            }}
          />
        ),
      });
    },
    [
      currentUserStaffId,
      setOpen,
      updateOrderApprovalStatus,
      inspectionOrder.id,
      orderApprovalsData,
    ]
  );

  const handleIssueButtonClick = useCallback(() => {
    setOpen({
      content: (
        <IssueEnforcementModal
          onSubmit={(message) => {
            refetchDataAndClose(message);
          }}
          inspectionOrder={inspectionOrder}
        />
      ),
    });
  }, [setOpen, inspectionOrder, refetchDataAndClose]);

  return (
    <>
      {isShowSendForApprovalButton && (
        <Button
          variant="text"
          onClick={handleSendForApproval}
          disabled={isDisableSendApprovalButton}
        >
          <SendRounded sx={{ mr: 1, fontSize: 20 }} />
          Send for Approval
        </Button>
      )}
      {isShowApprovalButtons && (
        <Box sx={{ display: "inline-flex", gap: 1 }}>
          <Button
            color="secondary"
            size="small"
            onClick={() => handleApprovalsButtonClick(true)}
          >
            Approve
          </Button>
          <Button
            color="secondary"
            size="small"
            onClick={() => handleApprovalsButtonClick(false)}
          >
            Not Approve
          </Button>
        </Box>
      )}
      {isShowIssueButton && (
        <Button onClick={handleIssueButtonClick}>Issue Order</Button>
      )}
    </>
  );
};

export default OrderApprovalButtons;
