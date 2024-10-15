import React from "react";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";
import { Box } from "@mui/material";
import { createFileRoute, useParams } from "@tanstack/react-router";
import FileProfileHeader from "@/components/App/FileProfileHeader";
import CaseFileGeneralInformation from "@/components/App/CaseFiles/Profile/CaseFileGeneralInformation";
import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";

export const Route = createFileRoute(
  "/_authenticated/ce-database/case-files/$caseFileNumber"
)({
  component: React.memo(CaseFileProfilePage),
  notFoundComponent: () => <p>Case File not found!</p>,
});

function CaseFileProfilePage() {
  const { caseFileNumber } = useParams({ strict: false });

  const {
    status,
    data: caseFileData,
    isError,
    error,
    isLoading,
  } = useCaseFileByNumber(caseFileNumber!);

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>{error.message}</h2>;

  return (
    <>
      {!caseFileNumber || status === "pending" ? (
        "Loading..."
      ) : (
        <>
          <FileProfileHeader
            fileNumber={caseFileNumber}
            status={caseFileData.case_file_status}
            breadcrumbs={[
              { label: "Case Files", to: "/ce-database/case-files" },
              { label: caseFileNumber },
            ]}
          />
          <Box p={"1rem 1rem 1.25rem 3.75rem"} display={"flex"} gap={3}>
            <CaseFileGeneralInformation caseFileData={caseFileData} />
            <ContinuationReport />
          </Box>
        </>
      )}
    </>
  );
}
