import { useQueryClient } from "@tanstack/react-query";
import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import { useInspectionByNumber } from "@/hooks/useInspections";
import { useDrawer } from "@/store/drawerStore";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { notify } from "@/store/snackbarStore";
import FileProfileHeader from "@/components/App/FileProfileHeader";
import { Box } from "@mui/material";
import ContinuationReport from "@/components/App/ContinuationReports/ContinuationReport";
import React from "react";
import InspectionGeneralInformation from "@/components/App/Inspections/Profile/InspectionGeneralInformation";
import ErrorPage from "@/components/Shared/ErrorPage";
import LoadingPage from "@/components/Shared/LoadingPage";

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
          inspection={inspectionData}
        />
      ),
      width: "1118px",
    });
  };

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({
      queryKey: ["inspection", inspectionNumber],
    });
    setClose();
    notify.success(submitMsg);
  };

  if (isError) return <ErrorPage error={error} />;

  return (
    <>
      {!inspectionNumber || status === "pending" ? (
        <LoadingPage isLoading={isLoading} />
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
