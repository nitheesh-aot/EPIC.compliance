import { FC, memo, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import { RequirementImage } from "@/models/Image";
import ImageCard from "./ImageCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arraySwap,
  rectSwappingStrategy,
} from "@dnd-kit/sortable";
import { useRequirementStore } from "@/components/App/Inspections/Profile/Requirements/requirementStore";

type ImagesContainerProps = {
  imageType: ImageTypeEnum;
  inspectionId: number;
  requirementId: number;
};

const ImagesContainer: FC<ImagesContainerProps> = memo(
  ({ imageType, inspectionId, requirementId }) => {
    const isPhoto = imageType === ImageTypeEnum.PHOTO;
    const { setOpen, setClose } = useModal();
    const [isExpanded, setIsExpanded] = useState(false);
    const {
      requirementPhotos,
      requirementFigures,
      setRequirementPhotos,
      setIsDataChanged,
    } = useRequirementStore();

    const [images, setImages] = useState<RequirementImage[]>([]);

    useEffect(() => {
      if (isPhoto) {
        setImages(
          requirementPhotos.filter(
            (photo) => photo.requirement_id === requirementId
          ) ?? []
        );
      } else {
        setImages(
          requirementFigures.filter(
            (figure) => figure.requirement_id === requirementId
          ) ?? []
        );
      }
    }, [isPhoto, requirementPhotos, requirementFigures, requirementId]);

    const activationConstraint = {
      delay: 100,
      tolerance: 0,
    };

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint }),
      useSensor(TouchSensor, { activationConstraint }),
      useSensor(MouseSensor, { activationConstraint })
    );

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = images
          .map((item) => item.id)
          .indexOf(active.id as number);
        const newIndex = images
          .map((item) => item.id)
          .indexOf(over?.id as number);
        const reorderedImages = arraySwap(images, oldIndex, newIndex);
        setImageLists(reorderedImages);
      }
    }

    const selectImage = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const newImageIndex =
            images.length > 0
              ? (images[images.length - 1].sort_order || 0) + 1
              : 1;
          setOpen({
            content: (
              <ImageModal
                onSubmit={(image) => {
                  setClose();
                  const newImages = [...images, image];
                  setImageLists(newImages);
                }}
                file={file}
                inspectionId={inspectionId}
                imageType={imageType}
                imageIndex={newImageIndex}
              />
            ),
            width: "640px",
          });
        }
      };
      input.click();
    };

    const handleImageClick = (image: RequirementImage) => {
      setOpen({
        content: (
          <ImageModal
            onSubmit={(updatedImage) => {
              const updatedImages = images.map((img) =>
                img.id === updatedImage.id ? updatedImage : img
              );
              setImageLists(updatedImages);
              setClose();
            }}
            onDelete={(imageId) => {
              const updatedImages = images.filter((img) => img.id !== imageId);
              setImageLists(updatedImages);
              setClose();
            }}
            requirementImage={image}
            inspectionId={inspectionId}
            imageType={imageType}
          />
        ),
        width: "640px",
      });
    };

    const setImageLists = (imagesList: RequirementImage[]) => {
      // Find the index of the first and last photo with this requirement ID
      const firstIndex = requirementPhotos.findIndex(
        (photo) => photo.requirement_id === requirementId
      );
      const lastIndex = requirementPhotos
        .map((photo) => photo.requirement_id)
        .lastIndexOf(requirementId);

      let updatedImagesList: RequirementImage[] = [];

      if (firstIndex !== -1 && lastIndex !== -1) {
        const firstSection = requirementPhotos.slice(0, firstIndex);
        const lastSection = requirementPhotos.slice(lastIndex + 1);
        updatedImagesList = [
          ...firstSection,
          ...imagesList,
          ...lastSection,
        ].map((photo, index) => ({
          ...photo,
          sort_order: index + 1,
        }));

        setRequirementPhotos(updatedImagesList);
      }

      // Set local component state directly with the updated list
      setImages(
        updatedImagesList.filter(
          (image) => image.requirement_id === requirementId
        )
      );
      setIsDataChanged(true);
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
        <AccordionDetails>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((image) => image.id ?? 0)}
                  strategy={rectSwappingStrategy}
                >
                  {images.map((image, index) => (
                    <ImageCard
                      key={`${image.id}-${index}`}
                      image={image}
                      handleImageClick={() => {
                        handleImageClick(image);
                      }}
                      isPhoto={isPhoto}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default ImagesContainer;
