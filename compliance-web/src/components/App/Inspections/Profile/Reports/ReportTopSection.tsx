import { Box, Typography, Button, Chip } from "@mui/material";
import { SendRounded } from "@mui/icons-material";
import {
  IR_APPROVAL_STATUS,
  IRProgressEnum,
  STAFF_USER_POSITION,
} from "@/utils/constants";
import { useMemo, useState, useEffect } from "react";
import { useUpdateIRApprovalStatus } from "@/hooks/useInspectionReports";
import { notify } from "@/store/snackbarStore";
import { useReportStore } from "./reportStore";
import { IRApproval } from "@/models/IRApproval";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { useStaffUsersData } from "@/hooks/useStaff";
import SendForApprovalModal from "./SendForApprovalModal";
import { useModal } from "@/store/modalStore";
import OfficerStepper from "./OfficerSteppr/OfficerStepper";
import PreviewDownloadButton from "./PreviewDownloadButton";
import IssueIRModal from "./IssueIRModal";

export default function ReportTopSection() {
  const { setOpen, setClose } = useModal();
  const currentUser = useCurrentLoggedInUser();
  const [irApprStatusBadge, setIrApprStatusBadge] = useState<{
    text: string;
    color: "default" | "error" | "success" | "warning";
  }>({ text: "", color: "default" });

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

  const handleIssueIR = () => {
    setOpen({
      content: (
        <IssueIRModal
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
      ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum) &&
      !isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  const isShowSendForApprovalButton = useMemo(() => {
    return (
      [
        IRProgressEnum.PRELIMINARY_DRAFTING,
        IRProgressEnum.FINALIZING_RECORD,
      ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum) ||
      isDisableApprovalButton
    );
  }, [inspectionReportsData, isDisableApprovalButton]);

  const isShowApprovalButtons = useMemo(() => {
    return (
      [
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW,
        IRProgressEnum.FINAL_DEPUTY_REVIEW,
      ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum) &&
      isCurrentUserApprover
    );
  }, [inspectionReportsData, isCurrentUserApprover]);

  const isShowOfficerStepper = useMemo(() => {
    return [
      IRProgressEnum.PRELIMINARY_APPROVED,
      IRProgressEnum.FINAL_APPROVED,
      IRProgressEnum.HOLDER_PRELIMINARY_REVIEW,
    ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum);
  }, [inspectionReportsData]);

  const isShowIssueIRButton = useMemo(() => {
    return (
      inspectionReportsData?.ir_progress?.id ===
        IRProgressEnum.FINAL_APPROVED &&
      inspectionReportsData?.intended_issuance_date
    );
  }, [inspectionReportsData]);

  useEffect(() => {
    if (
      [
        IRProgressEnum.PRELIMINARY_DEPUTY_REVIEW,
        IRProgressEnum.FINAL_DEPUTY_REVIEW,
      ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum)
    ) {
      setIrApprStatusBadge({
        text: "Decision Pending",
        color: "warning",
      });
    } else if (isShowOfficerStepper) {
      setIrApprStatusBadge({
        text: "Approved",
        color: "success",
      });
    } else if (
      [
        IRProgressEnum.PRELIMINARY_DRAFTING,
        IRProgressEnum.FINALIZING_RECORD,
      ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum) &&
      irApprovalsData?.[0]?.approval_status?.id ===
        IR_APPROVAL_STATUS.NOT_APPROVED
    ) {
      setIrApprStatusBadge({
        text: "Not Approved",
        color: "error",
      });
    } else if (
      inspectionReportsData?.ir_progress?.id === IRProgressEnum.ISSUED
    ) {
      setIrApprStatusBadge({
        text: "Issued",
        color: "success",
      });
    } else {
      setIrApprStatusBadge({
        text: "",
        color: "default",
      });
    }
  }, [inspectionReportsData, isShowOfficerStepper, irApprovalsData]);

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
        <Box display={"flex"} gap={1} alignItems={"center"}>
          <Typography variant="h6">
            {inspectionReportsData?.ir_status?.name} IR
          </Typography>
          {irApprStatusBadge.text && (
            <Chip
              label={irApprStatusBadge.text}
              color={irApprStatusBadge.color}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
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
          {isShowIssueIRButton && (
            <Button onClick={handleIssueIR}>Issue IR</Button>
          )}
          <PreviewDownloadButton />
        </Box>
      </Box>
      {isShowOfficerStepper && <OfficerStepper />}
    </>
  );
}
