import { Link } from "@mui/material";
import { Box } from "@mui/material";
import { Grid } from "@mui/material";
import { Image } from "@/models/Image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatS3Url } from "@/utils/appUtils";

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
    >
      <Box
        sx={{
          height: "150px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      >
        <img
          src={formatS3Url(image.relative_url ?? "")}
          alt={image.caption}
          width={"100%"}
          height={"100%"}
        />
      </Box>
      <Link>
        {isPhoto ? "Photo" : "Figure"} {index + 1}: {image.caption}
      </Link>
    </Grid>
  );
}
