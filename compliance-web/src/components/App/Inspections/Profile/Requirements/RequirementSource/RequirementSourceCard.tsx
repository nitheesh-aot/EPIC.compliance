import { FC, memo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AddRounded,
  DeleteOutlineRounded,
  EditOutlined,
  ExpandLessRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import {
  RequirementRelatedDocumentData,
  RequirementRelatedDocumentSectionData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import { BCDesignTokens } from "epic.theme";
import ParagraphWithReadMore from "@/components/Shared/ParagraphWithReadMore";
import { RequirementSourceEnum } from "@/utils/constants";
import RequirementRelatedDocumentCard from "./RequirementRelatedDocumentCard";
import { isRequirementSourceCondition } from "../RequirementUtils";

type RequirementSourceCardProps = {
  data: RequirementSourceFormData[];
  index: number;
  onEdit: (data: RequirementSourceFormData) => void;
  onDelete: (data: RequirementSourceFormData) => void;
  onAddSection: (data: RequirementSourceFormData) => void;
  onAddRelatedDocument: (data: RequirementSourceFormData) => void;
  onAddRelatedDocumentSection: (
    docData: RequirementRelatedDocumentData,
    srcData: RequirementSourceFormData
  ) => void;
  onEditRelatedDocumentSection: (
    data: RequirementRelatedDocumentSectionData
  ) => void;
  onDeleteRelatedDocumentSection: (
    data: RequirementRelatedDocumentSectionData
  ) => void;
};

const RequirementSourceCard: FC<RequirementSourceCardProps> = memo(
  ({
    data,
    index,
    onEdit,
    onDelete,
    onAddSection,
    onAddRelatedDocument,
    onAddRelatedDocumentSection,
    onDeleteRelatedDocumentSection,
    onEditRelatedDocumentSection,
  }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const requirementSource = data[0].requirementSource;
    const appendix = data[0].appendix;
    const isCondition = isRequirementSourceCondition(
      requirementSource?.id ?? ""
    );
    const isOrder = requirementSource?.id === RequirementSourceEnum.ORDER;

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
          aria-controls={`panel${index}-content`}
          id={`requirement-source-panel${index}-header`}
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
            <Typography variant="body2">
              <strong>
                {requirementSource?.name}
                {isOrder && ` — ${data[0].order?.order_number ?? ""}`}
                {requirementSource?.id === RequirementSourceEnum.EACA &&
                  ` #${data[0].sourceAmendmentNumber}`}
              </strong>
              {appendix && ` (Appendix ${appendix.appendix_no})`}
            </Typography>
          </Box>
          {isExpanded && (
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddSection(data[0]);
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
              {isCondition ? "Condition" : "Section"}
            </Button>
          )}
        </AccordionSummary>
        <AccordionDetails sx={{ padding: "0" }}>
          <Stack>
            {data
              .slice()
              .sort((a, b) =>
                (a.sourceNumber ?? "").localeCompare(b.sourceNumber ?? "")
              )
              .map((item, idx) => (
                <Box key={idx}>
                  <Box
                    sx={{
                      padding: "0.5rem 1rem 1rem",
                      borderBottom: `1px solid ${BCDesignTokens.surfaceColorBorderDefault}`,
                    }}
                  >
                    <Box
                      display={"flex"}
                      justifyContent={"space-between"}
                      gap={".25rem"}
                    >
                      <Box display={"flex"} gap={".25rem"}>
                        <Tooltip title="Edit" arrow>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onEdit(item)}
                            data-testid={`requirement-source-edit-${index}`}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onDelete(item)}
                            data-testid={`requirement-source-delete-${index}`}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Tooltip
                        title={`Add an extract from ${
                          !isOrder ? "a management plan or" : ""
                        } other document to support this requirement`}
                        arrow
                      >
                        <Button
                          variant="text"
                          color="secondary"
                          size="small"
                          onClick={() => onAddRelatedDocument(item)}
                          startIcon={<AddRounded />}
                          data-testid={`requirement-source-add-related-document-${index}`}
                          sx={{
                            backgroundColor: "transparent",
                            paddingY: 0,
                            height: "auto",
                            "& .MuiButton-startIcon": {
                              mr: 0,
                            },
                          }}
                        >
                          {isOrder
                            ? "Other Document"
                            : "Management Plan / Other Document"}
                        </Button>
                      </Tooltip>
                    </Box>
                    {!isOrder && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "1rem",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color={BCDesignTokens.typographyColorPlaceholder}
                          >
                            {isCondition ? "Condition #:" : "Section #:"}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {item.sourceNumber}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color={BCDesignTokens.typographyColorPlaceholder}
                          >
                            Title:
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {item.sourceTitle}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ marginTop: ".5rem" }}>
                      <Typography
                        variant="subtitle2"
                        color={BCDesignTokens.typographyColorPlaceholder}
                      >
                        Description:
                      </Typography>
                      <ParagraphWithReadMore
                        key={item.description?.html}
                        maxHeight={84}
                        isFormatted={true}
                        renderTypography={
                          <Typography
                            variant="subtitle2"
                            component={"div"}
                            dangerouslySetInnerHTML={{
                              __html: item.description?.html ?? "",
                            }}
                          />
                        }
                      />
                    </Box>
                  </Box>
                  {item.relatedDocuments?.map((relatedDocument, docIdx) => (
                    <RequirementRelatedDocumentCard
                      key={docIdx}
                      index={docIdx}
                      relatedDocument={relatedDocument}
                      onAddRelatedDocumentSection={() =>
                        onAddRelatedDocumentSection(relatedDocument, item)
                      }
                      onDeleteRelatedDocumentSection={
                        onDeleteRelatedDocumentSection
                      }
                      onEditRelatedDocumentSection={
                        onEditRelatedDocumentSection
                      }
                    />
                  ))}
                </Box>
              ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default RequirementSourceCard;
