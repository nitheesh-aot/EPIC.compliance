import React from "react";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";
import { Box } from "@mui/material";
import { createFileRoute, useParams } from "@tanstack/react-router";
import FileProfileHeader from "@/components/App/FileProfileHeader";
import CaseFileGeneralInformation from "@/components/App/CaseFiles/Profile/CaseFileGeneralInformation";
import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";
import CaseFileDrawer from "@/components/App/CaseFiles/CaseFileDrawer";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { useQueryClient } from "@tanstack/react-query";
import ErrorPage from "@/components/Shared/ErrorPage";
import LoadingPage from "@/components/Shared/LoadingPage";

export const Route = createFileRoute(
  "/_authenticated/ce-database/case-files/$caseFileNumber"
)({
  component: React.memo(CaseFileProfilePage),
  notFoundComponent: () => <p>Case File not found!</p>,
});

function CaseFileProfilePage() {
  const queryClient = useQueryClient();
  const { caseFileNumber } = useParams({ strict: false });
  const { setOpen, setClose } = useDrawer();

  const {
    status,
    data: caseFileData,
    isError,
    error,
    isLoading,
  } = useCaseFileByNumber(caseFileNumber!);

  const handleOpenEditModal = () => {
    setOpen({
      content: (
        <CaseFileDrawer onSubmit={handleOnSubmit} caseFile={caseFileData} />
      ),
      width: "718px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["case-file", caseFileNumber] });
    setClose();
    notify.success(submitMsg);
  };

  if (isError) return <ErrorPage error={error} />;

  return (
    <>
      {!caseFileNumber || status === "pending" ? (
        <LoadingPage isLoading={isLoading} />
      ) : (
        <>
          <FileProfileHeader
            fileNumber={caseFileNumber}
            status={caseFileData.case_file_status}
            breadcrumbs={[
              { label: "Case Files", to: "/ce-database/case-files" },
              { label: caseFileNumber },
            ]}
            showInspectionComplaintButton={true}
          />
          <Box p={"1rem 1rem 1.25rem 3.75rem"} display={"flex"} gap={3}>
            <CaseFileGeneralInformation
              caseFileData={caseFileData}
              onEdit={handleOpenEditModal}
            />
            <ContinuationReport />
          </Box>
        </>
      )}
    </>
  );
}
