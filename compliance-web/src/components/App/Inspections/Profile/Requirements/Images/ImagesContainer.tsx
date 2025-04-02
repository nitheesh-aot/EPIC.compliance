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
      requirementsList,
      requirementPhotos,
      requirementFigures,
      setRequirementsList,
      setRequirementPhotos,
      setRequirementFigures,
      setIsDataChanged,
    } = useRequirementStore();

    const [images, setImages] = useState<RequirementImage[]>([]);

    useEffect(() => {
      if (isPhoto) {
        setImages(requirementPhotos[requirementId] ?? []);
      } else {
        setImages(requirementFigures[requirementId] ?? []);
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
      const updatedRequirementImages: Record<number, RequirementImage[]> =
        isPhoto ? requirementPhotos : requirementFigures;

      updatedRequirementImages[requirementId] = imagesList;

      const updatedImagesWithSortOrder = Object.entries(
        updatedRequirementImages
      ).reduce(
        (acc, [reqId, images]) => {
          acc[Number(reqId)] = images.map((image) => ({ ...image }));
          return acc;
        },
        {} as Record<number, RequirementImage[]>
      );

      let initialIndex = 1;
      Object.values(updatedImagesWithSortOrder).forEach((images) => {
        images.forEach((image) => {
          image.sort_order = initialIndex;
          initialIndex++;
        });
      });

      if (isPhoto) {
        setRequirementPhotos(updatedImagesWithSortOrder);
      } else {
        setRequirementFigures(updatedImagesWithSortOrder);
      }

      updateRequirementFindings(updatedImagesWithSortOrder);

      // Update any active Lexical editor that might contain mentions related to these images
      updateActiveLexicalEditor(updatedImagesWithSortOrder[requirementId]);

      setImages(updatedImagesWithSortOrder[requirementId] ?? []);
      setIsDataChanged(true);
    };

    // Function to update Lexical editor mentions when images are updated
    const updateActiveLexicalEditor = (updatedImages: RequirementImage[]) => {
      // Find all active Lexical editor instances on the page
      const editorElements = document.querySelectorAll(".editor-input");

      if (!editorElements.length || !updatedImages) return;

      // For each editor instance, we need to update the mentions
      editorElements.forEach((editorElement) => {
        // Check if the editor is initialized and is accessible
        if (!editorElement || !(editorElement instanceof HTMLElement)) return;

        // Dispatch a custom event to update mentions in the Lexical editor
        const event = new CustomEvent("lexical-command", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "update-mentions",
            images: updatedImages,
          },
        });

        editorElement.dispatchEvent(event);
      });
    };

    const updateRequirementFindings = (
      updateImages: Record<number, RequirementImage[]>
    ) => {
      const updatedRequirementsList = requirementsList.map((requirement) => {
        const { findings } = requirement;
        if (!findings || !findings.includes("data-lexical-mention="))
          return requirement;

        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = findings;

        // Find all spans with data-lexical-mention attribute
        const mentionSpans = tempDiv.querySelectorAll(
          'span[data-lexical-mention="true"]'
        );

        const imagesList = updateImages[requirement.id];

        // Replace the content of each mention span with Updated Photo
        mentionSpans.forEach((span) => {
          const spanImageId = span.getAttribute("data-imageid");
          const image = imagesList?.find(
            (image) => image.id?.toString() === spanImageId
          );
          if (image) {
            const imageLabel = `${image.image_type} ${image.sort_order}`;
            span.textContent = imageLabel;
            span.setAttribute("data-mention", imageLabel);
            span.setAttribute("data-imageurl", image.relative_url ?? "");
          } else {
            span.parentNode?.removeChild(span);
          }
        });

        // Get the updated HTML
        const updatedFindings = tempDiv.innerHTML;

        return {
          ...requirement,
          findings: updatedFindings,
        };
      });
      setRequirementsList(updatedRequirementsList);
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
