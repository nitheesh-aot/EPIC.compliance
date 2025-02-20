import { FC, memo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
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
type ImagesContainerProps = {
  imageType: ImageTypeEnum;
};

const ImagesContainer: FC<ImagesContainerProps> = memo(({ imageType }) => {
  const { setOpen, setClose } = useModal();
  const [isExpanded, setIsExpanded] = useState(false);

  const isPhoto = imageType === ImageTypeEnum.PHOTO;

  const images: Image[] = [
    {
      id: 1,
      takenBy: {
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
      imageUrl:
        "https://www.banffjaspercollection.com/getmedia/b6290bdd-b11c-4bcf-9166-a5f4642f9276/PX-Family-Walking-to-Ice-Explorer.jpg?width=1400&height=850&ext=.jpg",
      imageFileName: "Family Walking to Ice Explorer.jpg",
      imageFileDate: "2024-01-01",
    },
    {
      id: 2,
      takenBy: {
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
      imageUrl:
        "https://www.banffjaspercollection.com/Brewster/media/Images/Attractions/Columbia-Icefield/Skywalk/PX-Columbia-Icefields-Skywalk.jpg?ext=.jpg",
      imageFileName: "Columbia Icefields Skywalk.jpg",
      imageFileDate: "2024-01-01",
    },
    {
      id: 3,
      takenBy: {
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
      imageUrl:
        "https://www.banffjaspercollection.com/getmedia/c81f4c67-8c96-4bbd-a125-06172c142306/PX-Sherp-Driving-on-Rocky-Road.jpg?width=1400&height=850&ext=.jpg",
      imageFileName: "Sherp Driving on Rocky Road.jpg",
    },
  ];

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
              onSubmit={() => {
                setClose();
              }}
              file={file}
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
            {images.map((image, index) => (
              <Grid
                item
                xs={6}
                key={image.id}
                sx={{
                  cursor: "pointer",
                  mb: 1,
                }}
                onClick={() => handleImageClick(image)}
              >
                <Box
                  sx={{
                    height: "150px",
                  }}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption}
                    width={"100%"}
                  />
                </Box>
                <Link>
                  {isPhoto ? "Photo" : "Figure"} {index + 1}: {image.caption}
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

export default ImagesContainer;
