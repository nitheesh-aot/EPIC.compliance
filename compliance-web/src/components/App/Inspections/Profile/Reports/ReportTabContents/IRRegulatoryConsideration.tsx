import { Typography } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import IRBoxContainer from "./IRBoxContainer";

const IRRegulatoryConsideration = () => {
  const { inspectionRegulatoryConsideration } = useReportStore();

  return (
    <IRBoxContainer title="Regulatory Consideration" onEdit={() => {}}>
      <Typography variant="body1" fontWeight={"bold"} mb={0.5}>
        {inspectionRegulatoryConsideration?.summary}
      </Typography>
      <Typography
        variant="body1"
        component={"div"}
        className="editor-content"
        mb={1.5}
        dangerouslySetInnerHTML={{
          __html: inspectionRegulatoryConsideration?.findings || "",
        }}
      />
    </IRBoxContainer>
  );
};

export default IRRegulatoryConsideration;
