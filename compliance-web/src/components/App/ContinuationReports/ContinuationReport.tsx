import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import { useMenuStore } from "@/store/menuStore";
import { AddRounded, SearchRounded } from "@mui/icons-material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import dateUtils from "@/utils/dateUtils";

export default function ContinuationReport() {
  const { appHeaderHeight } = useMenuStore();

  const handleAddNewEntry = () => {};

  const dummyCRTimeline = [
    {
      date: "2024-09-31T08:48:38.311Z",
      text: "BRUCEJ_20240007_IR001 is created.",
    },
    {
      date: "2024-10-28T23:28:11.311Z",
      text: "Some one updated",
    },
    {
      date: "2024-10-31T18:45:21.311Z",
      text: "20240007 is created.",
    },
  ];

  return (
    <Box
      width={"40%"}
      bgcolor={BCDesignTokens.surfaceColorBackgroundLightGray}
      height={`calc(100vh - ${appHeaderHeight + 198}px)`} // 158px is the height of the FileProfileHeader and the padding
      p={3}
      pb={2}
    >
      <Box display={"flex"} justifyContent={"space-between"} mb={2}>
        <Typography variant="h6">Continuation Report</Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={handleAddNewEntry}
          startIcon={<AddRounded />}
        >
          New Entry
        </Button>
      </Box>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchRounded />
            </InputAdornment>
          ),
        }}
      />
      <Timeline
        sx={{
          margin: 0,
          padding: 0,
        }}
      >
        {dummyCRTimeline.map((crt) => (
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
              {dummyCRTimeline.length - 1 !== dummyCRTimeline.indexOf(crt) && (
                <TimelineConnector />
              )}
            </TimelineSeparator>
            <TimelineContent sx={{ p: "4px 0px 4px 8px" }}>{crt.text}</TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}
