import { InspectionRequirement } from "@/models/InspectionRequirement";
import { Image } from "@/models/Image";
import IRBoxContainer from "./IRBoxContainer";
import { Box, Typography } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useInspectionRequirementImagesData } from "@/hooks/useInspectionRequirements";
import { formatS3Url } from "@/utils/appUtils";
import imageNotFound from "@/assets/images/image-not-found.svg";
import { DRAWER_WIDTHS } from "@/utils/constants";
import RequirementDrawer from "../../Requirements/RequirementDrawer";
import { useCallback, useMemo } from "react";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { Inspection } from "@/models/Inspection";
import { useQueryClient } from "@tanstack/react-query";

const DetailSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <>
    <Typography variant="body1" fontWeight={"bold"} mb={0.5}>
      {title}
    </Typography>
    <Typography
      variant="body1"
      component={"div"}
      className="editor-content"
      mb={1.5}
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  </>
);

const ImageSection = ({ image, index }: { image: Image; index: number }) => {
  return (
    <Box key={index} sx={{ marginBottom: 2 }}>
      <Box
        sx={{
          height: 150,
          width: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <img
          src={formatS3Url(image.relative_url ?? "")}
          alt={image.caption}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.src = imageNotFound;
            e.currentTarget.style.opacity = "0.5";
            e.currentTarget.style.width = "45%";
            e.currentTarget.style.height = "150px";
            e.currentTarget.style.objectFit = "contain";
          }}
        />
      </Box>
      <Typography variant="caption">
        {image.image_type} {index + 1}. {image.caption}
      </Typography>
    </Box>
  );
};

const BottomSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Typography variant="body1" fontWeight={"bold"}>
        {title}
      </Typography>
      <Typography variant="body1">{content}</Typography>
    </Box>
  );
};

const IRRequirement = ({
  requirement,
  requirementIndex,
}: {
  requirement: InspectionRequirement;
  requirementIndex: number;
}) => {
  const { inspectionData } = useReportStore();
  const { setOpen, setClose } = useDrawer();
  const queryClient = useQueryClient();

  const { data: photosData } = useInspectionRequirementImagesData(
    inspectionData?.id ?? 0,
    requirement?.id ?? 0,
    "photos"
  );

  const { data: figuresData } = useInspectionRequirementImagesData(
    inspectionData?.id ?? 0,
    requirement?.id ?? 0,
    "figures"
  );

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
          requirement={requirement}
          index={requirementIndex}
        />
      ),
      width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
    });
  }, [setOpen, handleOnSubmit, inspectionData, requirement, requirementIndex]);

  // Group requirement_source_details by requirement_source_id
  const groupedRequirementSources = useMemo(() => {
    return requirement.requirement_source_details.reduce((acc, item) => {
      const sourceId = item.requirement_source?.id;
      if (sourceId === undefined) {
        return acc;
      }
      if (!acc.has(String(sourceId))) {
        acc.set(String(sourceId), []);
      }
      acc.get(String(sourceId))!.push(item);
      return acc;
    }, new Map<string, (typeof requirement.requirement_source_details)[0][]>());
  }, [requirement]);

  return (
    <IRBoxContainer
      title={`#${requirementIndex + 1}. ${requirement.summary}`}
      onEdit={handleOpenEditRequirementModal}
    >
      {Array.from(groupedRequirementSources.entries()).map(
        ([sourceId, reqSourceDetails], groupIndex) => (
          <Box key={sourceId} sx={{ mb: 3 }}>
            {reqSourceDetails.map((reqSourceDetail, detailIndex) => (
              <Box key={reqSourceDetail.id} sx={{ mb: 2 }}>
                <DetailSection
                  title={`${detailIndex === 0 ? `Requirement ${groupIndex + 1}:` : ""} 
                  ${reqSourceDetail.condition_number ? `Condition ${reqSourceDetail.condition_number}` : `Section ${reqSourceDetail.section_number}`}
                  of ${reqSourceDetail.requirement_source?.name || ""}.
                  ${reqSourceDetail.title ?? ""}`}
                  content={reqSourceDetail.description || ""}
                />
                {reqSourceDetail.documents.map((document) => (
                  <DetailSection
                    key={document.id}
                    title={`${document.document_title} ${document.document_type?.name ?? ""} Section ${document.section_number ?? ""} ${document.section_title ?? ""}`}
                    content={document.description || ""}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )
      )}

      <DetailSection
        title="Inspection Details:"
        content={requirement.findings || ""}
      />

      {photosData?.map((photo, index) => (
        <ImageSection key={index} image={photo} index={index} />
      ))}

      {figuresData?.map((figure, index) => (
        <ImageSection key={index} image={figure} index={index} />
      ))}

      <BottomSection
        title="Compliance Finding:"
        content={requirement.compliance_finding?.name || ""}
      />
      <BottomSection
        title="Enforcement Action:"
        content={
          requirement.enforcement_action_data
            ?.map((action) => action.name)
            .join(", ") || ""
        }
      />
    </IRBoxContainer>
  );
};

export default IRRequirement;
