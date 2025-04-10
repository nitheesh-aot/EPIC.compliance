import { Box, Typography, Button } from "@mui/material";
import { PictureAsPdfOutlined, SendRounded } from "@mui/icons-material";
import {
  IR_APPROVAL_STATUS,
  IRProgressEnum,
  STAFF_USER_POSITION,
} from "@/utils/constants";
import { useMemo } from "react";
import { useUpdateIRApprovalStatus } from "@/hooks/useInspectionReports";
import { notify } from "@/store/snackbarStore";
import { useReportStore } from "./reportStore";
import { IRApproval } from "@/models/IRApproval";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { useStaffUsersData } from "@/hooks/useStaff";
import SendForApprovalModal from "./SendForApprovalModal";
import { useModal } from "@/store/modalStore";

export default function ReportTopSection() {
  const { setOpen, setClose } = useModal();
  const currentUser = useCurrentLoggedInUser();

  const {
    inspectionData,
    inspectionReportsData,
    irApprovalsData,
    setIRApprovalsData,
  } = useReportStore();

  const { data: staffData } = useStaffUsersData();

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

  const handleSendForApproval = () => {
    setOpen({
      content: (
        <SendForApprovalModal
          staffUsers={staffData ?? []}
          onSubmit={(message) => {
            notify.success(message);
            setClose();
          }}
        />
      ),
    });
  };

  const onSuccess = (data: IRApproval) => {
    setIRApprovalsData([data]);
    notify.success("Approval status updated");
  };

  const { mutate: updateIRApprovalStatus } =
    useUpdateIRApprovalStatus(onSuccess);

  const handleApproval = (isApprove: boolean) => {
    const currentUserId =
      staffData?.find(
        (staff) => staff.auth_user_guid === currentUser?.preferred_username
      )?.id ?? 0;
    updateIRApprovalStatus({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      approvalId: irApprovalsData?.[0]?.id ?? 0,
      statusPayload: {
        approval_status: isApprove
          ? IR_APPROVAL_STATUS.APPROVED
          : IR_APPROVAL_STATUS.NOT_APPROVED,
        approved_by_id: currentUserId,
      },
    });
  };

  const isDisableApprovalButton = useMemo(() => {
    return (
      inspectionReportsData?.ir_progress ===
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW && !isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  const isShowSendForApprovalButton = useMemo(() => {
    return (
      inspectionReportsData?.ir_progress ===
        IRProgressEnum.PRELIMINARY_DRAFTING || isDisableApprovalButton
    );
  }, [inspectionReportsData, isDisableApprovalButton]);

  const isShowApprovalButtons = useMemo(() => {
    return (
      inspectionReportsData?.ir_progress ===
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW && isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  return (
    <Box
      sx={{
        mb: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">Preliminary IR</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isShowSendForApprovalButton && (
          <Button
            variant="text"
            color="primary"
            onClick={handleSendForApproval}
            disabled={isDisableApprovalButton}
          >
            <SendRounded sx={{ mr: 0.5, fontSize: 20 }} />
            Send for Approval
          </Button>
        )}
        {isShowApprovalButtons ? (
          <>
            <Button
              color="secondary"
              size="small"
              onClick={() => handleApproval(true)}
            >
              Approve
            </Button>
            <Button
              color="secondary"
              size="small"
              onClick={() => handleApproval(false)}
            >
              Not Approve
            </Button>
          </>
        ) : null}
        <Button variant="text" color="primary">
          <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
          Preview
        </Button>
      </Box>
    </Box>
  );
}
