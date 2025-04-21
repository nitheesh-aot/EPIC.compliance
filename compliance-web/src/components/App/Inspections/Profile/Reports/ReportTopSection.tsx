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
import OfficerStepper from "./OfficerSteppr/OfficerStepper";

export default function ReportTopSection() {
  const { setOpen, setClose } = useModal();
  const currentUser = useCurrentLoggedInUser();

  const {
    queryClient,
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

  const refetchInspectionReportsData = () => {
    queryClient.invalidateQueries({
      queryKey: ["inspection-reports", inspectionData?.id],
    });
  };

  const handleSendForApproval = () => {
    setOpen({
      content: (
        <SendForApprovalModal
          staffUsers={staffData ?? []}
          onSubmit={(message) => {
            notify.success(message);
            setClose();
            refetchInspectionReportsData();
          }}
        />
      ),
    });
  };

  const onApprovalSuccess = (data: IRApproval) => {
    setIRApprovalsData([data]);
    notify.success("Approval status updated");
    refetchInspectionReportsData();
  };

  const { mutate: updateIRApprovalStatus } =
    useUpdateIRApprovalStatus(onApprovalSuccess);

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
      [
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW,
        IRProgressEnum.FINAL_DEPUTY_REVIEW,
      ].includes(inspectionReportsData?.ir_progress as IRProgressEnum) &&
      !isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  const isShowSendForApprovalButton = useMemo(() => {
    return (
      [
        IRProgressEnum.PRELIMINARY_DRAFTING,
        IRProgressEnum.FINALIZING_RECORD,
      ].includes(inspectionReportsData?.ir_progress as IRProgressEnum) ||
      isDisableApprovalButton
    );
  }, [inspectionReportsData, isDisableApprovalButton]);

  const isShowApprovalButtons = useMemo(() => {
    return (
      [
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW,
        IRProgressEnum.FINAL_DEPUTY_REVIEW,
      ].includes(inspectionReportsData?.ir_progress as IRProgressEnum) &&
      isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  const isShowOfficerStepper = useMemo(() => {
    return [
      IRProgressEnum.PRELIMINARY_APPROVED,
      IRProgressEnum.FINAL_APPROVED,
      IRProgressEnum.HOLDER_PRELIMINARY_REVIEW,
    ].includes(inspectionReportsData?.ir_progress as IRProgressEnum);
  }, [inspectionReportsData]);

  return (
    <>
      <Box
        sx={{
          mb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          {inspectionReportsData?.ir_status?.name} IR
        </Typography>
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
      {isShowOfficerStepper && <OfficerStepper />}
    </>
  );
}
