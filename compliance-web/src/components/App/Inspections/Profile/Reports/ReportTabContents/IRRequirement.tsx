import { InspectionRequirement } from "@/models/InspectionRequirement";
import { RequirementImage } from "@/models/Image";
import IRBoxContainer from "./IRBoxContainer";
import { Box, Typography } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { formatS3Url } from "@/utils/appUtils";
import imageNotFound from "@/assets/images/image-not-found.svg";
import { DRAWER_WIDTHS } from "@/utils/constants";
import RequirementDrawer from "../../Requirements/RequirementDrawer";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const ImageSection = ({ image }: { image: RequirementImage }) => {
  return (
    <Box key={image.id} sx={{ marginBottom: 2 }}>
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
        {image.image_type} {image.sort_order}. {image.caption}
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
  const { inspectionData, inspectionRequirementImages } = useReportStore();
  const { setOpen, setClose } = useDrawer();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<RequirementImage[]>([]);
  const [figures, setFigures] = useState<RequirementImage[]>([]);

  useEffect(() => {
    setPhotos(
      inspectionRequirementImages?.photos.filter(
        (photo) => photo.requirement_id === requirement.id
      ) ?? []
    );
    setFigures(
      inspectionRequirementImages?.figures.filter(
        (figure) => figure.requirement_id === requirement.id
      ) ?? []
    );
  }, [inspectionRequirementImages, requirement]);

  const handleOnSubmit = useCallback(
    (submitMsg: string) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirements", inspectionData?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirement-images", inspectionData?.id],
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
            {reqSourceDetails.map((reqSourceDetail) => (
              <Box key={reqSourceDetail.id} sx={{ mb: 2 }}>
                <DetailSection
                  title={`${groupIndex === 0 ? `Requirement ${requirementIndex + 1}:` : ""} 
                  ${reqSourceDetail.condition_number ? `Condition ${reqSourceDetail.condition_number}` : `Section ${reqSourceDetail.section_number}`}
                  of ${reqSourceDetail.requirement_source?.name || ""}.
                  ${reqSourceDetail.title ?? ""}`}
                  content={reqSourceDetail.description || ""}
                />
                {reqSourceDetail.documents.map((document) => (
                  <DetailSection
                    key={document.id}
                    title={`${document.document_title} Section ${document.section_number ?? ""} ${document.section_title ?? ""}`}
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

      {photos.map((photo) => (
        <ImageSection key={photo.id} image={photo} />
      ))}

      {figures.map((figure) => (
        <ImageSection key={figure.id} image={figure} />
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
