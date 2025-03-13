import { Typography } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import IRBoxContainer from "./IRBoxContainer";
import { DRAWER_WIDTHS } from "@/utils/constants";
import { useCallback } from "react";
import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import { useDrawer } from "@/store/drawerStore";
import { Inspection } from "@/models/Inspection";
import { notify } from "@/store/snackbarStore";
import { useQueryClient } from "@tanstack/react-query";

const IRRegulatoryConsideration = () => {
  const { inspectionRegulatoryConsideration, inspectionData } =
    useReportStore();
  const { setOpen, setClose } = useDrawer();
  const queryClient = useQueryClient();

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirements", inspectionData?.id],
      });
      notify.success(submitMsg);
      setClose();
    },
    [setClose, inspectionData, queryClient]
  );

  const handleOpenEditRequirementModal = useCallback(() => {
    setOpen({
      content: (
        <RequirementDrawer
          onSubmit={handleOnSubmit}
          inspectionData={inspectionData as Inspection}
          requirement={inspectionRegulatoryConsideration}
          isRegulatoryConsiderationExists={!!inspectionRegulatoryConsideration}
        />
      ),
      width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
    });
  }, [
    setOpen,
    handleOnSubmit,
    inspectionData,
    inspectionRegulatoryConsideration,
  ]);

  return (
    <IRBoxContainer
      title="Regulatory Consideration"
      onEdit={handleOpenEditRequirementModal}
    >
      {inspectionRegulatoryConsideration ? (
        <>
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
        </>
      ) : (
        <Typography variant="body1">None at this time.</Typography>
      )}
    </IRBoxContainer>
  );
};

export default IRRegulatoryConsideration;
