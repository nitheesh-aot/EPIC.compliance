import { InspectionRequirement } from "@/models/InspectionRequirement";
import { Image } from "@/models/Image";
import IRBoxContainer from "./IRBoxContainer";
import { Box, Typography } from "@mui/material";
import { useReportStore } from "@/components/App/Inspections/Profile/Reports/reportStore";
import { useInspectionRequirementImagesData } from "@/hooks/useInspectionRequirements";
import { formatS3Url } from "@/utils/appUtils";
import imageNotFound from "@/assets/images/image-not-found.svg";

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

const IRRequirement = ({
  requirement,
}: {
  requirement: InspectionRequirement;
}) => {
  const { inspectionData } = useReportStore();

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

  return (
    <IRBoxContainer title={requirement.summary}>
      {requirement.requirement_source_details.map((reqSourceDetail, index) => (
        <Box key={index}>
          <DetailSection
            title={`Requirement ${index + 1}: Condition ${reqSourceDetail.condition_number} of ${reqSourceDetail.requirement_source?.name || ""}`}
            content={reqSourceDetail.description || ""}
          />
          {reqSourceDetail.documents.map((document) => (
            <Box key={document.id}>
              <DetailSection
                title={`${document.document_title} ${document.document_type?.name ?? ""} Section ${document.section_number ?? ""} ${document.section_title ?? ""}`}
                content={document.description || ""}
              />
            </Box>
          ))}
        </Box>
      ))}
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
    </IRBoxContainer>
  );
};

export default IRRequirement;
