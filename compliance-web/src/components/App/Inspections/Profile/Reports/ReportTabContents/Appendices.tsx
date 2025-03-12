import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useAppendicesData } from "@/hooks/useAppendices";
import IRBoxContainer from "./IRBoxContainer";
import { Typography } from "@mui/material";

const Appendices = () => {
  const { inspectionData } = useReportStore();

  const { data: appendices } = useAppendicesData(inspectionData?.id ?? 0);

  return (
    <IRBoxContainer title="Appendices">
      {appendices?.map((appendix) => (
        <Typography variant="body1" key={appendix.id} sx={{ mb: 1 }}>
          Appendix {appendix.appendix_no}. {appendix.document_title}
        </Typography>
      ))}
    </IRBoxContainer>
  );
};

export default Appendices;
