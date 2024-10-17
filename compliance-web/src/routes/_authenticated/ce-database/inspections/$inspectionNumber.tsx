import { useQueryClient } from "@tanstack/react-query";
import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { useInspectionByNumber } from "@/hooks/useInspections";
import { useDrawer } from "@/store/drawerStore";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { notify } from "@/store/snackbarStore";
import FileProfileHeader from "@/components/App/FileProfileHeader";
import { Box } from "@mui/material";
import CaseFileGeneralInformation from "@/components/App/CaseFiles/Profile/CaseFileGeneralInformation";
import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";
import React from "react";
import InspectionGeneralInformation from "@/components/App/Inspections/Profile/InspectionGeneralInformation";

export const Route = createFileRoute(
  "/_authenticated/ce-database/inspections/$inspectionNumber"
)({
  component: React.memo(InspectionProfilePage),
  notFoundComponent: () => <p>Inspection not found!</p>,
});

function InspectionProfilePage() {
  const queryClient = useQueryClient();
  const { inspectionNumber } = useParams({ strict: false });
  const { setOpen, setClose } = useDrawer();

  const {
    status,
    data: inspectionData,
    isError,
    error,
    isLoading,
  } = useInspectionByNumber(inspectionNumber!);

  const handleOpenEditModal = () => {
    setOpen({
      content: (
        <InspectionDrawer
          onSubmit={handleOnSubmit}
          // inspection={inspectionData}
        />
      ),
      width: "718px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({
      queryKey: ["inspection", inspectionNumber],
    });
    setClose();
    notify.success(submitMsg);
  };

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>{error.message}</h2>;

  return (
    <>
      {!inspectionNumber || status === "pending" ? (
        "Loading..."
      ) : (
        <>
          <FileProfileHeader
            fileNumber={inspectionNumber}
            status={inspectionData.inspection_status}
            breadcrumbs={[
              { label: "Inspections", to: "/ce-database/inspections" },
              { label: inspectionNumber },
            ]}
          />
          <Box p={"1rem 1rem 1.25rem 3.75rem"} display={"flex"} gap={3}>
            <InspectionGeneralInformation
              inspectionData={inspectionData}
              onEdit={handleOpenEditModal}
            />
            <ContinuationReport />
          </Box>
        </>
      )}
    </>
  );
}
