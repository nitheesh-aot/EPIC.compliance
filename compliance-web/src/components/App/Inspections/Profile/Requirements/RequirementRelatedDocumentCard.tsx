import { FC, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DeleteOutlineRounded,
  EditOutlined,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { AddRounded } from "@mui/icons-material";
import { BCDesignTokens } from "epic.theme";
import { ExpandLessRounded } from "@mui/icons-material";
import { RequirementRelatedDocumentFormData } from "@/models/InspectionRequirement";
import ParagraphWithReadMore from "@/components/Shared/ParagraphWithReadMore";

interface RequirementRelatedDocumentCardProps {
  relatedDocument: RequirementRelatedDocumentFormData;
  index: number;
}

const RequirementRelatedDocumentCard: FC<
  RequirementRelatedDocumentCardProps
> = ({ relatedDocument, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Accordion
      key={index}
      expanded={isExpanded}
      onChange={(_, expanded) => {
        setIsExpanded(expanded);
      }}
      sx={{
        border: 0,
        borderRadius: "0 !important",
        backgroundColor: BCDesignTokens.surfaceColorBackgroundLightGray,
        borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
        "&.Mui-expanded": {
          margin: "0",
        },
      }}
    >
      <AccordionSummary
        aria-controls={`panel${index}-content`}
        id={`requirement-related-document-panel${index}-header`}
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
            {relatedDocument.documentTitle}
          </Typography>
        </Box>
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
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
          Section
        </Button>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: "1rem" }}>
        <Box display={"flex"} justifyContent={"flex-end"} gap={".25rem"}>
          <Tooltip title="Edit" arrow>
            <IconButton size="small" color="secondary" onClick={() => {}}>
              <EditOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton size="small" color="secondary" onClick={() => {}}>
              <DeleteOutlineRounded />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            marginBottom: ".5rem",
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color={BCDesignTokens.typographyColorPlaceholder}
            >
              Section #:
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {relatedDocument.sectionNumber}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color={BCDesignTokens.typographyColorPlaceholder}
            >
              Section Title:
            </Typography>
            <Typography variant="body2">
              {relatedDocument.sectionTitle}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            color={BCDesignTokens.typographyColorPlaceholder}
          >
            Description:
          </Typography>
          <ParagraphWithReadMore
            maxHeight={84}
            renderTypography={
              <Typography
                variant="subtitle2"
                component={"div"}
                className="quill-render"
                dangerouslySetInnerHTML={{
                  __html: relatedDocument.description?.html ?? "",
                }}
              />
            }
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default RequirementRelatedDocumentCard;
