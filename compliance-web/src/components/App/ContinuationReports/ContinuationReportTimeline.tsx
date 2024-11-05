import dateUtils from "@/utils/dateUtils";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { Stack, Typography } from "@mui/material";
import { ContinuationReport } from "@/models/ContinuationReport";

// TODO: Change according to model from API reponse
interface ContinuationReportTimelineProps {
  crtList: ContinuationReport[];
}

export default function ContinuationReportTimeline({
  crtList,
}: ContinuationReportTimelineProps) {
  return (
    <Timeline
      sx={{
        margin: 0,
        padding: 0,
      }}
    >
      {crtList.map((crt) => (
        <TimelineItem key={crt.date_created}>
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
            <TimelineDot sx={{p: "2px"}} />
            {crtList.length - 1 !== crtList.indexOf(crt) && (
              <TimelineConnector />
            )}
          </TimelineSeparator>
          <TimelineContent sx={{ p: "4px 0px 4px 8px" }}>
            <Typography variant="subtitle2">{crt.text}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
