import React, { useMemo } from "react";
import BreadcrumbsNav from "@/components/Shared/BreadcrumbsNav";
import ComingSoon from "@/components/Shared/ComingSoon";
import { useCaseFileByNumber } from "@/hooks/useCaseFiles";
import { useMenuStore } from "@/store/menuStore";
import dateUtils from "@/utils/dateUtils";
import {
  AddRounded,
  EditRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { Box, Button, Chip, Typography } from "@mui/material";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { BCDesignTokens } from "epic.theme";

export const Route = createFileRoute(
  "/_authenticated/ce-database/case-files/$caseFileNumber"
)({
  component: React.memo(CaseFileProfilePage),
  notFoundComponent: () => <p>Case File not found!</p>,
});

function CaseFileProfilePage() {
  const { caseFileNumber } = useParams({ strict: false });
  const { appHeaderHeight } = useMenuStore();

  const {
    status,
    data: caseFileData,
    isError,
    error,
    isLoading,
  } = useCaseFileByNumber(caseFileNumber!);

  const renderCaseFileProperty = useMemo(
    () => (propertyName: string, propertyValue?: string) => (
      <Box display={"flex"} gap={4} marginBottom={1}>
        <Typography
          variant="body1"
          color={BCDesignTokens.typographyColorPlaceholder}
          width={120}
        >
          {propertyName}
        </Typography>
        <Typography variant="body1">{propertyValue ?? ""}</Typography>
      </Box>
    ),
    []
  );

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>{error.message}</h2>;

  return (
    <>
      {!caseFileNumber || status === "pending" ? (
        "Loading..."
      ) : (
        <>
          <Header
            caseFileNumber={caseFileNumber}
            caseFileData={caseFileData}
          />
          <Content
            caseFileData={caseFileData}
            renderCaseFileProperty={renderCaseFileProperty}
            appHeaderHeight={appHeaderHeight}
          />
        </>
      )}
    </>
  );
}

const Header = React.memo(({ caseFileNumber, caseFileData }: {
  caseFileNumber: string;
  caseFileData: any;
}) => (
  <Box
    display={"flex"}
    justifyContent={"space-between"}
    bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
    padding={"1.5rem 2.5rem 1.5rem 3.75rem"}
  >
    <Box display={"flex"} flexDirection={"column"} gap={1}>
      <BreadcrumbsNav
        items={[
          { label: "Case Files", to: "/ce-database/case-files" },
          { label: caseFileNumber },
        ]}
      />
      <Box display={"flex"} gap={1} alignItems={"center"}>
        <Typography variant="h3">{caseFileNumber}</Typography>
        <Chip
          label={caseFileData.case_file_status}
          color={
            caseFileData.case_file_status?.toLowerCase() === "open"
              ? "success"
              : "error"
          }
          variant="outlined"
          size="small"
        />
      </Box>
    </Box>
    <Box display={"flex"} gap={1}>
      <Button
        variant="text"
        size="small"
        onClick={() => {}}
        startIcon={<AddRounded />}
      >
        Inspection
      </Button>
      <Button
        variant="text"
        size="small"
        onClick={() => {}}
        startIcon={<AddRounded />}
      >
        Complaint
      </Button>
      <Button
        variant="text"
        size="small"
        onClick={() => {}}
        startIcon={<ExpandMoreRounded />}
      >
        Actions
      </Button>
    </Box>
  </Box>
));

const Content = React.memo(({ caseFileData, renderCaseFileProperty, appHeaderHeight }: {
  caseFileData: any;
  renderCaseFileProperty: (label: string, value?: string) => React.ReactNode;
  appHeaderHeight: number;
}) => (
  <Box>
    <Box p={"1rem 1rem 1.25rem 3.75rem"} display={"flex"} gap={3}>
      <Box display={"flex"} flexGrow={1} flexDirection={"column"}>
        <Box display={"flex"} justifyContent={"space-between"} my={3}>
          <Typography variant="h6">General Information</Typography>
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => {}}
            startIcon={<EditRounded />}
          >
            Edit
          </Button>
        </Box>
        <Box display={"flex"} gap={8}>
          <Box>
            {renderCaseFileProperty("Project", caseFileData.project.name)}
            {renderCaseFileProperty(
              "Date Created",
              dateUtils.formatDate(caseFileData.date_created)
            )}
            {renderCaseFileProperty("Initiation", caseFileData.initiation.name)}
          </Box>
          <Box>
            {renderCaseFileProperty(
              "Lead Officer",
              caseFileData.lead_officer?.full_name
            )}
            {renderCaseFileProperty("Other Officers")}
          </Box>
        </Box>
      </Box>
      <Box
        width={"40%"}
        bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
        height={`calc(100vh - ${appHeaderHeight + 158}px)`}
      >
        <ComingSoon />
      </Box>
    </Box>
  </Box>
));
