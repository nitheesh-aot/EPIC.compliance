import { FC, memo, useEffect, useState } from "react";
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
import { usePopover } from "@/store/popoverStore";
import AppendixPopover from "./AppendixPopover";
import { useAppendicesData } from "@/hooks/useAppendices";
import { Appendix } from "@/models/Appendix";

type AppendicesContainerProps = {
  inspectionId: number;
  isRequirementEditable?: boolean;
};

const AppendicesContainer: FC<AppendicesContainerProps> = memo(
  ({ inspectionId, isRequirementEditable }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { setOpen, setClose } = usePopover();

    const { appendices, setAppendices, setIsDataChanged } =
      useRequirementStore();

    const { data: appendicesData, refetch } = useAppendicesData(inspectionId);

    useEffect(() => {
      if (appendicesData) {
        setAppendices(appendicesData);
      }
    }, [appendicesData, setAppendices]);

    const addNewAppendix = (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen({
        anchorEl: event.currentTarget,
        content: (
          <AppendixPopover
            onSubmit={refreshAppendicesLists}
            inspectionId={inspectionId}
          />
        ),
        width: "440px",
      });
    };

    const editAppendix = (
      event: React.MouseEvent<HTMLAnchorElement>,
      appendix: Appendix
    ) => {
      setOpen({
        anchorEl: event.currentTarget,
        content: (
          <AppendixPopover
            onSubmit={refreshAppendicesLists}
            inspectionId={inspectionId}
            appendixData={appendix}
          />
        ),
        width: "440px",
      });
    };

    const refreshAppendicesLists = () => {
      refetch();
      setIsDataChanged(true);
      setClose();
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
        <AccordionDetails sx={{ p: 2 }}>
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
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color={BCDesignTokens.typographyColorPlaceholder}
              >
                List of Appendices:
              </Typography>
              {appendices.map((appendix) => (
                <Link
                  key={appendix.id}
                  sx={{
                    display: "flex",
                    gap: 0.75,
                    fontSize: "0.875rem",
                    cursor: isRequirementEditable ? "pointer" : "default",
                    "&:hover": {
                      textDecoration: isRequirementEditable ? "underline" : "none",
                    },
                  }}
                  underline="none"
                  onClick={(e) => isRequirementEditable && editAppendix(e, appendix)}
                >
                  <span>{appendix.appendix_no}.</span>
                  <span>{appendix.document_title}</span>
                </Link>
              ))}
            </Box>
          )}
          {isRequirementEditable && (
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={(e) => {
                addNewAppendix(e);
              }}
              startIcon={<AddRounded />}
              sx={{
                backgroundColor: "transparent",
                px: 0.5,
                mt: 2,
                height: "auto",
                "& .MuiButton-startIcon": {
                  mr: 0,
                },
              }}
            >
              New Appendix
            </Button>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default AppendicesContainer;
