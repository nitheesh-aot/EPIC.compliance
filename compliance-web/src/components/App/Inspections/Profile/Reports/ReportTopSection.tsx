import { Box, Typography, Button } from "@mui/material";
import { PictureAsPdfOutlined, SendRounded } from "@mui/icons-material";
import {
  IR_APPROVAL_STATUS,
  IRProgressEnum,
  STAFF_USER_POSITION,
} from "@/utils/constants";
import { useMemo, useState } from "react";
import {
  useInspectionRecordRender,
  useUpdateIRApprovalStatus,
} from "@/hooks/useInspectionReports";
import { notify } from "@/store/snackbarStore";
import { useReportStore } from "./reportStore";
import { IRApproval } from "@/models/IRApproval";
import { useCurrentLoggedInUser } from "@/hooks/useAuthorization";
import { useStaffUsersData } from "@/hooks/useStaff";
import SendForApprovalModal from "./SendForApprovalModal";
import { useModal } from "@/store/modalStore";
import OfficerStepper from "./OfficerSteppr/OfficerStepper";
import ReportPreviewModal from "./ReportPreviewModal";

export default function ReportTopSection() {
  const { setOpen, setClose } = useModal();
  const currentUser = useCurrentLoggedInUser();
  const [previewClicked, setPreviewClicked] = useState(false);

  const {
    queryClient,
    inspectionData,
    inspectionReportsData,
    irApprovalsData,
    setIRApprovalsData,
  } = useReportStore();

  const { data: staffData } = useStaffUsersData();

  const { refetch: refetchIrRenderData } = useInspectionRecordRender(
    inspectionData?.id ?? 0,
    inspectionReportsData?.id ?? 0,
    "html",
    false
  );

  const handlePreviewClick = async () => {
    setPreviewClicked(true);
    try {
      const result = await refetchIrRenderData();
      if (result.data) {
        setPreviewClicked(false);

        if (result.data.html) {
          // Handle HTML preview
          const html = result.data.html ?? "";
          setOpen({
            content: <ReportPreviewModal previewHtml={html} />,
            width: "660px",
          });
        } else {
          // Create a Blob from the PDF data
          const blob = new Blob([result.data], { type: "application/pdf" });

          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);

          // Create an anchor element and set properties for download
          const link = document.createElement("a");
          link.href = url;
          link.download = `inspection-report-${inspectionReportsData?.id || "download"}.pdf`;

          // Append to body, click and clean up
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Release the blob URL
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      notify.error("Failed to generate PDF preview");
      setPreviewClicked(false);
    }
  };

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
        IRProgressEnum.HOLDER_PRELIMINARY_REVIEW,
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
      // IRProgressEnum.HOLDER_PRELIMINARY_REVIEW, QN: should I show send button for this?
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
          <Button
            variant="text"
            color="primary"
            onClick={handlePreviewClick}
            disabled={previewClicked}
          >
            <PictureAsPdfOutlined sx={{ mr: 1, fontSize: 20 }} />
            {previewClicked ? "Loading..." : "Preview"}
          </Button>
        </Box>
      </Box>
      {isShowOfficerStepper && <OfficerStepper />}
    </>
  );
}
