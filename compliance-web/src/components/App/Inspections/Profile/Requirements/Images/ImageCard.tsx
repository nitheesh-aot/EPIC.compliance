import { Link, Tooltip } from "@mui/material";
import { Box } from "@mui/material";
import { RequirementImage } from "@/models/Image";
import { arraySwap, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatS3Url } from "@/utils/appUtils";
import imageNotFound from "@/assets/images/image-not-found.svg";
import { BCDesignTokens } from "epic.theme";

type ImageCardProps = {
  image: RequirementImage;
  handleImageClick: () => void;
  isPhoto: boolean;
};

export default function ImageCard({
  image,
  handleImageClick,
  isPhoto,
}: ImageCardProps) {
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({
      id: image.id ?? 0,
      getNewIndex: ({ id, items, activeIndex, overIndex }) =>
        arraySwap(items, activeIndex, overIndex).indexOf(id),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      id={image.id?.toString()}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "calc(50% - 4px)",
        borderRadius: "4px",
        padding: "8px",
        pb: "12px",
        boxSizing: "border-box",
        backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: BCDesignTokens.surfaceColorBackgroundLightBlue,
        },
      }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleImageClick}
      data-testid={`image-card-${image.id}`}
    >
      <Box
        sx={{
          height: 150,
          marginBottom: 0.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          pointerEvents: "none", // Disable drag on this image
        }}
      >
        <img
          src={formatS3Url(image.relative_url ?? "")}
          alt={image.caption}
          width={"100%"}
          onError={(e) => {
            e.currentTarget.src = imageNotFound;
            e.currentTarget.style.opacity = "0.5";
            e.currentTarget.style.width = "45%";
            e.currentTarget.style.height = "150px";
          }}
        />
      </Box>
      <Tooltip title={image.caption}>
        <Link
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <strong>
            {isPhoto ? "Photo" : "Figure"} {image.sort_order}:
          </strong>{" "}
          {image.caption}
        </Link>
      </Tooltip>
    </Box>
  );
}
