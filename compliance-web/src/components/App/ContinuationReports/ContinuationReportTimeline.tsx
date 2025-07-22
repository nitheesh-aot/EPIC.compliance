import { KC_USER_GROUPS, useIsRolesAllowed } from "@/hooks/useAuthorization";
import { ContinuationReport } from "@/models/ContinuationReport";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import dateUtils from "@/utils/dateUtils";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { BCDesignTokens } from "epic.theme";
import { useCallback } from "react";
import { useAuth } from "react-oidc-context";
import ContinuationReportEntryModal from "./ContinuationReportEntryModal";
import ContinuationReportTimelineEntry from "./ContinuationReportTimelineEntry";

interface ContinuationReportTimelineProps {
  crtList: ContinuationReport[];
  searchText?: string;
  isAllowEdit?: boolean;
}

export default function ContinuationReportTimeline({
  crtList,
  searchText,
  isAllowEdit,
}: ContinuationReportTimelineProps) {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();
  const { user: authUser } = useAuth();

  const allowCREntryEdit = useIsRolesAllowed([KC_USER_GROUPS.SUPERUSER]);

  const handleOnSubmit = useCallback(
    (submitMsg: string, caseFileId: number) => {
      queryClient.invalidateQueries({
        queryKey: ["continuation-reports", caseFileId],
      });
      setClose();
      notify.success(submitMsg);
    },
    [queryClient, setClose]
  );

  const handleEditEntry = useCallback(
    (crtEntry: ContinuationReport) => {
      setOpen({
        content: (
          <ContinuationReportEntryModal
            onSubmit={(msg) => handleOnSubmit(msg, crtEntry.case_file_id)}
            context={{
              caseFileId: crtEntry.case_file_id,
              contextType: crtEntry.context_type,
              contextId: crtEntry.context_id,
            }}
            continuationReportEntry={crtEntry}
          />
        ),
        width: "640px",
      });
    },
    [setOpen, handleOnSubmit]
  );

  const timelineItemStyles = (isAllowEdit?: boolean) => ({
    minHeight: 54,
    cursor: isAllowEdit ? "pointer" : "default",
    ":hover": isAllowEdit
      ? {
          background: BCDesignTokens.themeGray30,
          borderRadius: BCDesignTokens.layoutBorderRadiusLarge,
        }
      : {},
  });

  const isCurrentUserEntry = (entryUserId?: string) => {
    return authUser?.profile?.preferred_username === entryUserId;
  };

  return (
    <Timeline
      sx={{
        margin: 0,
        padding: 0,
      }}
    >
      {crtList.map((crt) => (
        <TimelineItem
          key={crt.id}
          sx={timelineItemStyles(
            !crt.system_generated &&
              isAllowEdit &&
              (allowCREntryEdit ||
                isCurrentUserEntry(crt.created_by_user?.auth_user_guid))
          )}
          onClick={
            !crt.system_generated &&
            isAllowEdit &&
            (allowCREntryEdit ||
              isCurrentUserEntry(crt.created_by_user?.auth_user_guid))
              ? () => handleEditEntry(crt)
              : undefined
          }
        >
          <TimelineOppositeContent
            color="textSecondary"
            sx={{ padding: "8px 8px 4px 0px", flex: 0.1 }}
          >
            <Stack width={72}>
              <Typography variant="caption">
                {dateUtils.formatDate(crt.date_created)}
              </Typography>
              <Typography variant="caption">
                {dateUtils.formatDate(crt.date_created, "HH:mm")}
              </Typography>
            </Stack>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ p: "2px" }} />
            {crtList.length - 1 !== crtList.indexOf(crt) && (
              <TimelineConnector />
            )}
          </TimelineSeparator>
          <ContinuationReportTimelineEntry
            key={crt.id}
            renderText={crt.rich_text}
            keys={crt.keys}
            createdByUser={crt.created_by_user?.name}
            isSystemGenerated={crt.system_generated}
            searchText={searchText}
          />
        </TimelineItem>
      ))}
    </Timeline>
  );
}
