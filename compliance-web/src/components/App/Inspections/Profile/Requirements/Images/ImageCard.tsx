import { Link } from "@mui/material";
import { Box } from "@mui/material";
import { Grid } from "@mui/material";
import { Image } from "@/models/Image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ImageCardProps = {
  image: Image;
  handleImageClick: (image: Image) => void;
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
      key={image.id}
      id={image.id?.toString()}
      sx={{
        cursor: "pointer",
        mb: 1,
      }}
      onClick={() => handleImageClick(image)}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Box
        sx={{
          height: "150px",
        }}
      >
        <img src={image.imageUrl} alt={image.caption} width={"100%"} />
      </Box>
      <Link>
        {isPhoto ? "Photo" : "Figure"} {index + 1}: {image.caption}
      </Link>
    </Grid>
  );
}
