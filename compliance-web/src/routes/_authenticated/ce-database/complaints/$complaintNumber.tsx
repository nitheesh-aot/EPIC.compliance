import ComplaintDrawer from "@/components/App/Complaints/ComplaintDrawer";
import ComplaintGeneralInformation from "@/components/App/Complaints/Profile/ComplaintGeneralInformation";
import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";
import FileProfileHeader from "@/components/App/FileProfileHeader";
import ErrorPage from "@/components/Shared/ErrorPage";
import LoadingPage from "@/components/Shared/LoadingPage";
import { useComplaintByNumber } from "@/hooks/useComplaints";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { Box } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/ce-database/complaints/$complaintNumber"
)({
  component: React.memo(ComplaintProfilePage),
  notFoundComponent: () => <p>Complaint not found!</p>,
});

function ComplaintProfilePage() {
  const queryClient = useQueryClient();
  const { complaintNumber } = useParams({ strict: false });
  const { setOpen, setClose } = useDrawer();

  const {
    status,
    data: complaintData,
    isError,
    error,
    isLoading,
  } = useComplaintByNumber(complaintNumber!);

  const handleOpenEditModal = () => {
    setOpen({
      content: (
        <ComplaintDrawer onSubmit={handleOnSubmit} complaint={complaintData} />
      ),
      width: "1118px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({
      queryKey: ["complaint", complaintNumber],
    });
    setClose();
    notify.success(submitMsg);
  };

  if (isError) return <ErrorPage error={error} />;

  return (
    <>
      {!complaintNumber || status === "pending" ? (
        <LoadingPage isLoading={isLoading} />
      ) : (
        <>
          <FileProfileHeader
            fileNumber={complaintNumber}
            status={complaintData.status}
            breadcrumbs={[
              { label: "Complaints", to: "/ce-database/complaints" },
              { label: complaintNumber },
            ]}
          />
          <Box p={"1rem 1rem 1.25rem 3.75rem"} display={"flex"} gap={3}>
            <ComplaintGeneralInformation
              complaintData={complaintData}
              onEdit={handleOpenEditModal}
            />
            <ContinuationReport />
          </Box>
        </>
      )}
    </>
  );
}
