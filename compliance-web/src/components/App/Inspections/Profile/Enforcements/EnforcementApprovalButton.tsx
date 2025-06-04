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
} from "@/hooks/useInspectionOrders";
import { StaffUser } from "@/models/Staff";
import { OrderApproval } from "@/models/OrderApproval";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { STAFF_USER_POSITION } from "@/utils/constants";
import { OrderProgressEnum } from "@/utils/constants";
import { InspectionOrder } from "@/models/InspectionOrder";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

const EnforcementApprovalButton = ({
  inspectionId,
  inspectionOrder,
}: {
  inspectionId: number;
  inspectionOrder: InspectionOrder;
}) => {
  const { setOpen, setClose } = useModal();
  const { data: staffData } = useStaffUsersData();
  const currentUser = useCurrentLoggedInUser();

  const { data: orderApprovalsData, refetch: refetchOrderApprovals } =
    useFetchOrderApprovals(inspectionId, inspectionOrder.id ?? 0);

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

  const onSuccess = (data: OrderApproval) => {
    // eslint-disable-next-line no-console
    console.log(data);
    notify.success("Approval request sent");
    setClose();
    refetchOrderApprovals();
  };

  const { mutate: createOrderApproval, isPending } =
    useCreateOrderApproval(onSuccess);

  const onSendForApprovalSubmitHandler = useCallback(
    (data: SendForApprovalFormType) => {
      const directorId = (data.director as StaffUser).id;
      createOrderApproval({
        inspectionId,
        inspectionOrderId: inspectionOrder.id ?? 0,
        approvalPayload: {
          approved_by_id: directorId,
        },
      });
    },
    [createOrderApproval, inspectionId, inspectionOrder.id]
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

  const handleApprovalsButtonClick = useCallback(
    (isApprove: boolean) => {
      // eslint-disable-next-line no-console
      console.log(isApprove, currentUserStaffId);
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
              // eslint-disable-next-line no-console
              console.log("approve", isApprove);
            }}
          />
        ),
      });
    },
    [currentUserStaffId, setOpen]
  );

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
    </>
  );
};

export default EnforcementApprovalButton;
