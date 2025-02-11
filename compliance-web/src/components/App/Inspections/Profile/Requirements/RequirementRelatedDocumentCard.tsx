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
import {
  RequirementRelatedDocumentData,
  RequirementRelatedDocumentSectionData,
} from "@/models/InspectionRequirement";
import ParagraphWithReadMore from "@/components/Shared/ParagraphWithReadMore";

interface RequirementRelatedDocumentCardProps {
  relatedDocument: RequirementRelatedDocumentData;
  index: number;
  onAddRelatedDocumentSection: () => void;
  onDeleteRelatedDocumentSection: (
    data: RequirementRelatedDocumentSectionData
  ) => void;
  onEditRelatedDocumentSection: (
    data: RequirementRelatedDocumentSectionData
  ) => void;
}

const RequirementRelatedDocumentCard: FC<
  RequirementRelatedDocumentCardProps
> = ({
  index,
  relatedDocument,
  onAddRelatedDocumentSection,
  onDeleteRelatedDocumentSection,
  onEditRelatedDocumentSection,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
        {isExpanded && (
          <Button
            variant="text"
            color="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddRelatedDocumentSection();
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
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: "0" }}>
        {relatedDocument.sections
          ?.sort((a, b) =>
            (a.sectionNumber ?? "").localeCompare(b.sectionNumber ?? "")
          )
          .map((section, idx) => (
            <Box
              key={idx}
              sx={{
                padding: "1rem",
                borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
              }}
            >
              <Box display={"flex"} justifyContent={"flex-end"} gap={".25rem"}>
                <Tooltip title="Edit" arrow>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => onEditRelatedDocumentSection(section)}
                  >
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => onDeleteRelatedDocumentSection(section)}
                  >
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
                    {section.sectionNumber}
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
                    {section.sectionTitle}
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
                  key={section.description?.html}
                  maxHeight={84}
                  isFormatted={true}
                  renderTypography={
                    <Typography
                      variant="subtitle2"
                      component={"div"}
                      dangerouslySetInnerHTML={{
                        __html: section.description?.html ?? "",
                      }}
                    />
                  }
                />
              </Box>
            </Box>
          ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default RequirementRelatedDocumentCard;
