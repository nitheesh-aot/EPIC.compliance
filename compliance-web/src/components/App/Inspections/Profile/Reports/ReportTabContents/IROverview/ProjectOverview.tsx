import GridLabelValuePair from "@/components/Shared/GridLabelValuePair";
import { AddRounded } from "@mui/icons-material";
import { Box, Grid, Typography, Link, Button } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import MailingAddressPopover from "./MailingAddressPopover";
import { usePopover } from "@/store/popoverStore";
import { useEffect, useState } from "react";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { formatAuthorization } from "@/utils/appUtils";
import { useUpdateInspectionRecord } from "@/hooks/useInspectionReports";
import { notify } from "@/store/snackbarStore";
import { InspectionRecord } from "@/models/InspectionRecord";
import { IRProgressEnum } from "@/utils/constants";

const ProjectOverview = () => {
  const {
    inspectionData,
    caseFileData,
    inspectionReportsData,
    irApprovalsData,
    setInspectionReportsData,
  } = useReportStore();
  const { setOpen, setClose } = usePopover();
  const [mailingAddress, setMailingAddress] = useState("");

  useEffect(() => {
    setMailingAddress(inspectionReportsData?.mailing_address ?? "");
  }, [inspectionReportsData]);

  const handleOnSuccess = (data: InspectionRecord) => {
    notify.success("Mailing address updated");
    setInspectionReportsData(data);
    setClose();
  };

  const { mutate: updateInspectionRecord } =
    useUpdateInspectionRecord(handleOnSuccess);

  const updateMailingAddress = (mailingAddress: string) => {
    updateInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      updateRecord: {
        field_name: "mailing_address",
        value: mailingAddress,
      },
    });
  };

  const addMailingAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen({
      anchorEl: event.currentTarget,
      content: <MailingAddressPopover onSubmit={updateMailingAddress} />,
      width: "440px",
    });
  };

  const editMailingAddress = (
    event: React.MouseEvent<HTMLAnchorElement>,
    mailingAddress: string
  ) => {
    setOpen({
      anchorEl: event.currentTarget,
      content: (
        <MailingAddressPopover
          onSubmit={updateMailingAddress}
          mailingAddress={mailingAddress}
        />
      ),
      width: "440px",
    });
  };

  const getApprovedBy = () => {
    const isApproved = [
      IRProgressEnum.PRELIMINARY_APPROVED,
      IRProgressEnum.FINAL_APPROVED,
      IRProgressEnum.ISSUED,
    ].includes(inspectionReportsData?.ir_progress?.id as IRProgressEnum);
    if (isApproved) {
      const approvedBy = irApprovalsData?.[0]?.approved_by;
      return `${approvedBy?.name}, ${approvedBy?.position?.name}`;
    }
    return "";
  };

  return (
    <Box
      sx={{
        backgroundColor: BCDesignTokens.surfaceColorBackgroundLightBlue,
        py: 2,
        px: 3,
        borderRadius: 1,
        mb: 1,
      }}
    >
      <Grid container spacing={1}>
        <GridLabelValuePair
          label="Project"
          value={caseFileData?.project?.name}
        />
        <GridLabelValuePair
          label="Inspection No."
          value={inspectionData?.ir_number}
          gridProps={{ xs: 6 }}
        />
        <GridLabelValuePair
          label="IR Status"
          value={inspectionReportsData?.ir_status?.name}
          gridProps={{ xs: 6 }}
        />
        <GridLabelValuePair
          label="Regulated Party"
          value={caseFileData?.regulated_party}
          gridProps={{ xs: 6 }}
        />
        <GridLabelValuePair
          label="EA Certificate #"
          value={formatAuthorization(caseFileData?.authorization)}
          gridProps={{ xs: 6 }}
        />
        <Grid item xs={12}>
          <Typography
            variant="body2"
            color={BCDesignTokens.typographyColorPlaceholder}
          >
            Mailing Address
          </Typography>
          {mailingAddress ? (
            <Link
              sx={{
                display: "flex",
                gap: 0.75,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              underline="none"
              onClick={(e) => editMailingAddress(e, mailingAddress)}
            >
              {mailingAddress}
            </Link>
          ) : (
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={addMailingAddress}
              startIcon={<AddRounded />}
              sx={{
                backgroundColor: "transparent",
                px: 0,
                height: "auto",
                "& .MuiButton-startIcon": {
                  mr: 0,
                },
              }}
            >
              Add Mailing Address
            </Button>
          )}
        </Grid>
        <GridLabelValuePair
          label="Record Approved By"
          value={getApprovedBy()}
        />
      </Grid>
    </Box>
  );
};

export default ProjectOverview;
