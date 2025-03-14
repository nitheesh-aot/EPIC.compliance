import { Typography } from "@mui/material";
import IRBoxContainer from "./IRBoxContainer";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useEffect } from "react";
import { notify } from "@/store/snackbarStore";
import { useUpdateInspectionRecord } from "@/hooks/useInspectionReports";
import { InspectionRecord } from "@/models/InspectionRecord";

const ActionsRequired = () => {
  const {
    inspectionData,
    inspectionReportsData,
    actionsRequired,
    setActionsRequired,
  } = useReportStore();

  useEffect(() => {
    setActionsRequired(inspectionReportsData?.action_required_by_rp ?? "");
  }, [inspectionReportsData, setActionsRequired]);

  const handleOnSuccess = (data: InspectionRecord) => {
    setActionsRequired(data.action_required_by_rp ?? "");
    notify.success("Actions required updated");
  };

  const { mutate: updateInspectionRecord } =
    useUpdateInspectionRecord(handleOnSuccess);

  const handleSaveActionsRequired = (editorValue: string) => {
    updateInspectionRecord({
      inspectionId: inspectionData?.id ?? 0,
      inspectionRecordId: inspectionReportsData?.id ?? 0,
      updateRecord: {
        field_name: "action_required_by_rp",
        value: editorValue,
      },
    });
  };

  return (
    <IRBoxContainer
      title="Actions Required by Certificate Holder and Comments"
      defaultValue={actionsRequired}
      onEditSubmit={handleSaveActionsRequired}
    >
      <Typography
        variant="body1"
        component={"div"}
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: actionsRequired || "" }}
      />
    </IRBoxContainer>
  );
};

export default ActionsRequired;
