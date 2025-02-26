import { Link } from "@mui/material";
import { Box } from "@mui/material";
import { Grid } from "@mui/material";
import { Image } from "@/models/Image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatS3Url } from "@/utils/appUtils";
import imageNotFound from "@/assets/images/image-not-found.svg";

type ImageCardProps = {
  image: Image;
  handleImageClick: () => void;
  isPhoto: boolean;
  index: number;
};

export default function ImageCard({
  image,
  handleImageClick,
  isPhoto,
  index,
}: ImageCardProps) {
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({ id: image.id ?? 0 });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Grid
      item
      xs={6}
      id={index.toString()}
      sx={{
        cursor: "pointer",
        mb: 1,
      }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleImageClick}
    >
      <Box
        sx={{
          height: "150px",
        }}
      >
        <img
          src={formatS3Url(image.relative_url ?? "")}
          alt={image.caption}
          width={"100%"}
          height={"100%"}
          onError={(e) => {
            e.currentTarget.src = imageNotFound;
            e.currentTarget.style.opacity = "0.5";
            e.currentTarget.style.width = "45%";
          }}
        />
      </Box>
      <Link>
        {isPhoto ? "Photo" : "Figure"} {index + 1}: {image.caption}
      </Link>
    </Grid>
  );
}
