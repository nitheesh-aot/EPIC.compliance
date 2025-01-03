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
  PostAddOutlined,
} from "@mui/icons-material";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import { BCDesignTokens } from "epic.theme";
import ParagraphWithReadMore from "@/components/Shared/ParagraphWithReadMore";
import { RequirementSourceEnum } from "@/utils/constants";

type RequirementSourceCardProps = {
  data: RequirementSourceFormData;
  index: number;
  onEdit: (data: RequirementSourceFormData) => void;
  onDelete: (data: RequirementSourceFormData) => void;
  onAddSection: (data: RequirementSourceFormData) => void;
};

const RequirementSourceCard: FC<RequirementSourceCardProps> = memo(
  ({ data, index, onEdit, onDelete, onAddSection }) => {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    const isCondition = [
      RequirementSourceEnum.SCHEDULE_B,
      RequirementSourceEnum.EAC,
      RequirementSourceEnum.EACA,
    ].includes(data.requirementSource?.id as RequirementSourceEnum);

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
            <Typography variant="body2" fontWeight={700}>
              {data.requirementSource?.name}
              {data.requirementSource?.id === RequirementSourceEnum.EACA &&
                ` #${data.sourceAmendmentNumber}`}
            </Typography>
          </Box>
          <Button
            variant="text"
            color="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddSection(data);
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
        </AccordionSummary>
        <AccordionDetails>
          <Stack>
            <Box display={"flex"} justifyContent={"flex-end"} gap={".25rem"}>
              <Tooltip title="Add Related Document" arrow>
                <IconButton size="small" color="secondary">
                  <PostAddOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" arrow>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => onEdit(data)}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => onDelete(data)}
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
                  {isCondition ? "Condition #:" : "Section #:"}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {data.sourceNumber}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  color={BCDesignTokens.typographyColorPlaceholder}
                >
                  Title:
                </Typography>
                <Typography variant="body2">{data.sourceTitle}</Typography>
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
                      __html: data.description?.html ?? "",
                    }}
                  />
                }
              />
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default RequirementSourceCard;
