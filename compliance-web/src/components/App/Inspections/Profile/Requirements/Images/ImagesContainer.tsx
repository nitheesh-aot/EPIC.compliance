import { FC, memo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import {
  AddRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { BCDesignTokens } from "epic.theme";
import { ImageTypeEnum } from "@/components/App/Inspections/Profile/Requirements/RequirementUtils";
import { useModal } from "@/store/modalStore";
import ImageModal from "./ImageModal";
import { Image } from "@/models/Image";
import ImageCard from "./ImageCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

const imagesDummyData: Image[] = [
  {
    id: 1,
    taken_by: {
      position: {
        id: "3",
        name: "Deputy Director, Compliance & Enforcement Operations",
      },
      name: "Maggie Chard",
      id: 1,
      first_name: "Maggie",
      last_name: "Chard",
      position_id: 3,
      auth_user_guid: "0b98f18a9179454aafbc9cf87060b169@idir",
      is_active: true,
    },
    caption: "A photo of a family walking to the ice explorer",
    relative_url:
      "compliance/inspections/1/requirements-images/f4ccf063-5065-41a7-9b8f-157db731f59a.jpg",
    original_file_name: "Family Walking to Ice Explorer.jpg",
    date_taken: "2024-01-01",
  },
  {
    id: 2,
    taken_by: {
      position: {
        id: "3",
        name: "Deputy Director, Compliance & Enforcement Operations",
      },
      name: "Maggie Chard",
      id: 1,
      first_name: "Maggie",
      last_name: "Chard",
      position_id: 3,
      auth_user_guid: "0b98f18a9179454aafbc9cf87060b169@idir",
      is_active: true,
    },
    caption: "A photo of a skywalk",
    relative_url:
      "compliance/inspections/1/requirements-images/4b10c4c3-74c7-4d84-b139-56f3515e4fbd.jpg",
    original_file_name: "Columbia Icefields Skywalk.jpg",
    date_taken: "2024-01-01",
  },
  {
    id: 3,
    taken_by: {
      position: {
        id: "3",
        name: "Deputy Director, Compliance & Enforcement Operations",
      },
      name: "Maggie Chard",
      id: 1,
      first_name: "Maggie",
      last_name: "Chard",
      position_id: 3,
      auth_user_guid: "0b98f18a9179454aafbc9cf87060b169@idir",
      is_active: true,
    },
    caption: "A photo of a skywalk",
    relative_url:
      "compliance/inspections/1/requirements-images/a34c8a96-0eb1-4380-9f4c-c8fc8f5f0bab.jpg",
    original_file_name: "Sherp Driving on Rocky Road.jpg",
    date_taken: "2024-01-01",
  },
];

type ImagesContainerProps = {
  imageType: ImageTypeEnum;
  inspectionId: number;
};

const ImagesContainer: FC<ImagesContainerProps> = memo(
  ({ imageType, inspectionId }) => {
    const { setOpen, setClose } = useModal();
    const [isExpanded, setIsExpanded] = useState(false);
    const [images, setImages] = useState(imagesDummyData);

    const isPhoto = imageType === ImageTypeEnum.PHOTO;

    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setImages((items) => {
          const oldIndex = items
            .map((item) => item.id)
            .indexOf(active.id as number);
          const newIndex = items
            .map((item) => item.id)
            .indexOf(over?.id as number);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }

    const selectImage = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          setOpen({
            content: (
              <ImageModal
                onSubmit={(image) => {
                  setClose();
                  setImages([...images, image]);
                }}
                file={file}
                inspectionId={inspectionId}
              />
            ),
            width: "640px",
          });
        }
      };
      input.click();
    };

    const handleImageClick = (image: Image) => {
      setOpen({
        content: (
          <ImageModal
            onSubmit={() => {
              setClose();
            }}
            imageData={image}
            inspectionId={inspectionId}
          />
        ),
        width: "640px",
      });
    };

    return (
      <Accordion
        expanded={isExpanded}
        onChange={(_, expanded) => {
          setIsExpanded(expanded);
        }}
        sx={{
          marginTop: "1rem",
          border: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
          borderRadius: BCDesignTokens.layoutBorderRadiusMedium,
          "&.Mui-expanded:first-of-type": {
            marginTop: "1rem",
          },
        }}
      >
        <AccordionSummary
          aria-controls={`panel-${imageType}-content`}
          id={`panel-${imageType}-header`}
          sx={{
            "&.Mui-expanded": {
              minHeight: "48px",
              padding: "0.875rem 1rem",
              borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
              backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
              "& .MuiAccordionSummary-content": {
                margin: "0",
              },
            },
            "& .MuiAccordionSummary-content": {
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
            },
          }}
        >
          <Box display={"flex"} alignItems={"flex-start"} gap={0.5}>
            {isExpanded ? <ExpandLessRounded /> : <ExpandMoreRounded />}
            <Typography variant="body2" fontWeight={700}>
              {isPhoto ? "Photos" : "Figures"}
            </Typography>
          </Box>
          {isExpanded && (
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                selectImage();
              }}
              startIcon={<AddRounded />}
              sx={{
                backgroundColor: "transparent",
                paddingY: 0,
                height: "auto",
                "& .MuiButton-startIcon": {
                  mr: 0,
                },
              }}
            >
              {isPhoto ? "Photo" : "Figure"}
            </Button>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 2 }}>
          {images.length === 0 && (
            <Typography
              variant="body2"
              color={BCDesignTokens.typographyColorPlaceholder}
            >
              {isPhoto
                ? "No photos uploaded yet. Add photos to get started"
                : "No figures uploaded yet. Add figures to get started"}
            </Typography>
          )}
          {images.length > 0 && (
            <Grid container spacing={2}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((image) => image.id ?? 0)}
                  strategy={rectSortingStrategy}
                >
                  {images.map((image, index) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      handleImageClick={() => handleImageClick(image)}
                      isPhoto={isPhoto}
                      index={index}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default ImagesContainer;
