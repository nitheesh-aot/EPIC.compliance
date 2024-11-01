import dateUtils from "@/utils/dateUtils";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { Box, Stack } from "@mui/material";

// TODO: Change according to model from API reponse
interface ContinuationReportTimelineProps {
  crtList: { date: string; text: string }[];
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
        <TimelineItem key={crt.date}>
          <TimelineOppositeContent
            color="textSecondary"
            sx={{ padding: "4px 8px 4px 0px", flex: 0.2 }}
          >
            <Stack width={90}>
              <Box>{dateUtils.formatDate(crt.date)}</Box>
              <Box>{dateUtils.formatDate(crt.date, "HH:mm")}</Box>
            </Stack>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            {crtList.length - 1 !== crtList.indexOf(crt) && (
              <TimelineConnector />
            )}
          </TimelineSeparator>
          <TimelineContent sx={{ p: "4px 0px 4px 8px" }}>
            {crt.text}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
