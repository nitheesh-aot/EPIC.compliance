import { FC, memo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import {
  AddRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { BCDesignTokens } from "epic.theme";
import { useRequirementStore } from "@/components/App/Inspections/Profile/Requirements/requirementStore";
import { Appendix } from "@/models/Appendix";

type AppendicesContainerProps = {
  inspectionId: number;
};

const AppendicesContainer: FC<AppendicesContainerProps> = memo(
  ({ inspectionId }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { appendices, setAppendices, setIsDataChanged } =
      useRequirementStore();

    const addNewAppendix = () => {
      // eslint-disable-next-line no-console
      console.log("addNewAppendix popover", inspectionId);
      setAppendicesLists([]);
    };

    const setAppendicesLists = (appendicesList: Appendix[]) => {
      setAppendices(appendicesList);
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
          aria-controls={`panel-appendices-content`}
          id={`panel-appendices-header`}
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
              Appendices
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {appendices.length === 0 && (
            <Typography
              variant="body2"
              color={BCDesignTokens.typographyColorPlaceholder}
            >
              No Appendices added yet. Add appendix to get started.
            </Typography>
          )}
          {appendices.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {appendices.map((appendix) => (
                <Link
                  key={appendix.id}
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {appendix.appendix_no}. {appendix.document_title}
                </Link>
              ))}
            </Box>
          )}
          <Button
            variant="text"
            color="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              addNewAppendix();
            }}
            startIcon={<AddRounded />}
            sx={{
              backgroundColor: "transparent",
              px: 0.5,
              mt: 1.25,
              height: "auto",
              "& .MuiButton-startIcon": {
                mr: 0,
              },
            }}
          >
            New Appendix
          </Button>
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default AppendicesContainer;
