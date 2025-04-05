import RequirementDrawer from "@/components/App/Inspections/Profile/Requirements/RequirementDrawer";
import {
  useInspectionRequirementImages,
  useInspectionRequirementsData,
  useUpdateInspectionRequirementBatch,
} from "@/hooks/useInspectionRequirements";
import { Inspection } from "@/models/Inspection";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { AddRounded } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Reorder } from "framer-motion";
import React, { useCallback, useEffect } from "react";
import RequirementCard from "./Requirements/RequirementCard";
import {
  formatRequirementBatchAPIData,
  formatRequirementImagesInFindings,
  REGULATORY_CONSIDERATION_TYPE_ID,
  REQUIREMENT_TYPE_ID,
  updateImagesWithContinuousSortOrder,
} from "./Requirements/RequirementUtils";
import { DRAWER_WIDTHS } from "@/utils/constants";
import { useRequirementStore } from "./Requirements/requirementStore";
import { RequirementImage } from "@/models/Image";
import { mergeMapsWithArrayConcat } from "@/utils/appUtils";

interface InspectionRequirementsProps {
  inspectionData: Inspection;
}

const InspectionRequirements: React.FC<InspectionRequirementsProps> = ({
  inspectionData,
}) => {
  const queryClient = useQueryClient();
  const { setOpen, isOpen, setClose } = useDrawer();
  const {
    requirementPhotos,
    requirementFigures,
    setRequirementPhotos,
    setRequirementFigures,
    setRequirementsList,
  } = useRequirementStore();
  const [activeRequirementId, setActiveRequirementId] = React.useState<
    number | null
  >(null);
  const [inspectionRequirements, setInspectionRequirements] = React.useState<
    InspectionRequirement[]
  >([]);
  const [regulatoryConsideration, setRegulatoryConsideration] =
    React.useState<InspectionRequirement | null>(null);
  const [isDataLoading, setIsDataLoading] = React.useState<boolean>(true);

  const {
    data: inspectionRequirementsData,
    isLoading: isInspectionRequirementsLoading,
  } = useInspectionRequirementsData(inspectionData.id);

  const {
    data: inspectionRequirementImages,
    isLoading: isInspectionRequirementImagesLoading,
  } = useInspectionRequirementImages(inspectionData.id);

  const { mutate: updateInspectionRequirementBatch } =
    useUpdateInspectionRequirementBatch(() => {});

  useEffect(() => {
    if (inspectionRequirementsData) {
      const inspectionRequirements = inspectionRequirementsData.filter(
        (req) => req.req_type?.id === REQUIREMENT_TYPE_ID
      );
      setRequirementsList(inspectionRequirements);
      setInspectionRequirements(inspectionRequirements);

      setRegulatoryConsideration(
        inspectionRequirementsData.find(
          (req) => req.req_type?.id === REGULATORY_CONSIDERATION_TYPE_ID
        ) ?? null
      );
    }
  }, [inspectionRequirementsData, setRequirementsList]);

  useEffect(() => {
    if (inspectionRequirementImages) {
      setRequirementPhotos(
        inspectionRequirementImages.photos.reduce((acc, photo) => {
          const reqId = photo.requirement_id ?? 0;
          if (!acc.has(reqId)) {
            acc.set(reqId, []);
          }
          acc.set(reqId, [...(acc.get(reqId) || []), photo]);
          return acc;
        }, new Map<number, RequirementImage[]>())
      );
      setRequirementFigures(
        inspectionRequirementImages.figures.reduce((acc, figure) => {
          const reqId = figure.requirement_id ?? 0;
          if (!acc.has(reqId)) {
            acc.set(reqId, []);
          }
          acc.set(reqId, [...(acc.get(reqId) || []), figure]);
          return acc;
        }, new Map<number, RequirementImage[]>())
      );
    }
  }, [
    inspectionRequirementImages,
    setRequirementPhotos,
    setRequirementFigures,
  ]);

  const handleOnSubmit = useCallback(
    (submitMsg: string, isClose: boolean = true) => {
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirements", inspectionData.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["inspection-requirement-images", inspectionData.id],
      });
      notify.success(submitMsg);
      if (isClose) {
        setClose();
      }
    },
    [queryClient, inspectionData, setClose]
  );

  const handleOpenAddRequirementModal = useCallback(() => {
    setOpen({
      content: (
        <RequirementDrawer
          onSubmit={handleOnSubmit}
          inspectionData={inspectionData}
        />
      ),
      width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
    });
  }, [setOpen, handleOnSubmit, inspectionData]);

  const handleOpenAddRegulatoryConsiderationModal = useCallback(() => {
    setOpen({
      content: (
        <RequirementDrawer
          onSubmit={handleOnSubmit}
          inspectionData={inspectionData}
          isRegulatoryConsideration={true}
        />
      ),
      width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
    });
  }, [setOpen, handleOnSubmit, inspectionData]);

  const handleOpenEditRequirementModal = useCallback(
    (
      requirement: InspectionRequirement,
      index?: number,
      isRegulatoryConsideration?: boolean
    ) => {
      setActiveRequirementId(requirement.id);
      setOpen({
        content: (
          <RequirementDrawer
            onSubmit={handleOnSubmit}
            inspectionData={inspectionData}
            requirement={requirement}
            index={index}
            isRegulatoryConsideration={isRegulatoryConsideration}
          />
        ),
        width: DRAWER_WIDTHS.REQUIREMENT_DRAWER,
      });
    },
    [setOpen, handleOnSubmit, inspectionData]
  );

  // Add a ref to store the timeout ID : to prevent multiple API calls during reordering
  const updateTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  const handleSortOrderChange = useCallback(
    (newOrder: InspectionRequirement[]) => {
      // Create a new map to store updated requirement photos with the new order
      const updatedPhotosNewReqOrder = new Map<number, RequirementImage[]>();
      const updatedFiguresNewReqOrder = new Map<number, RequirementImage[]>();

      // Copy photos from the original map to the new map based on the new order of requirements
      newOrder.forEach((requirement) => {
        updatedPhotosNewReqOrder.set(
          requirement.id,
          requirementPhotos.get(requirement.id) || []
        );
        updatedFiguresNewReqOrder.set(
          requirement.id,
          requirementFigures.get(requirement.id) || []
        );
      });

      const photosWithSortOrder = updateImagesWithContinuousSortOrder(
        updatedPhotosNewReqOrder
      );
      const figuresWithSortOrder = updateImagesWithContinuousSortOrder(
        updatedFiguresNewReqOrder
      );

      const requirementImages = mergeMapsWithArrayConcat(
        photosWithSortOrder,
        figuresWithSortOrder
      );

      // update the requirement images sort order in all findings
      const updatedRequirementsList = formatRequirementImagesInFindings(
        newOrder,
        requirementImages
      );

      // Update local state immediately
      setRequirementPhotos(photosWithSortOrder);
      setRequirementFigures(figuresWithSortOrder);
      setRequirementsList(updatedRequirementsList);
      setInspectionRequirements(updatedRequirementsList);

      // Update query client cache
      queryClient.setQueryData(
        ["inspection-requirements", inspectionData.id],
        newOrder
      );

      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Set a new timeout to make the API call 500ms after the last reordering
      updateTimeoutRef.current = setTimeout(() => {
        const requirementBatchAPIData = formatRequirementBatchAPIData(
          updatedRequirementsList,
          photosWithSortOrder,
          figuresWithSortOrder
        );
        
        updateInspectionRequirementBatch({
          inspectionId: inspectionData.id,
          requirementBatch: requirementBatchAPIData,
        });
      }, 500);
    },
    [
      inspectionData,
      queryClient,
      requirementFigures,
      requirementPhotos,
      setRequirementFigures,
      setRequirementPhotos,
      setRequirementsList,
      updateInspectionRequirementBatch,
    ]
  );

  // Clean up the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveRequirementId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      !isInspectionRequirementsLoading &&
      !isInspectionRequirementImagesLoading
    ) {
      setIsDataLoading(false);
    }
  }, [isInspectionRequirementsLoading, isInspectionRequirementImagesLoading]);

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      flexDirection={"column"}
      overflow={"auto"}
    >
      <Box display={"flex"} justifyContent={"space-between"} mt={3} mb={2}>
        <Typography variant="h6">Requirements</Typography>
        {!isDataLoading && (
          <Box display={"flex"} gap={2}>
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={handleOpenAddRegulatoryConsiderationModal}
              startIcon={<AddRounded />}
              data-cy="new-regulatory-consideration-button"
              disabled={!!regulatoryConsideration}
            >
              Regulatory Consideration
            </Button>
            <Button
              color="secondary"
              size="small"
              onClick={handleOpenAddRequirementModal}
              startIcon={<AddRounded />}
              data-cy="new-requirement-button"
            >
              New Requirement
            </Button>
          </Box>
        )}
      </Box>
      {isDataLoading ? (
        <Box display={"flex"} justifyContent={"center"} mt={6}>
          <CircularProgress size={80} />
        </Box>
      ) : (
        <>
          <Reorder.Group
            axis="y"
            onReorder={handleSortOrderChange}
            values={inspectionRequirements}
            className="reorder-list"
          >
            {inspectionRequirements?.map((requirement, index) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                index={index}
                onEdit={() =>
                  handleOpenEditRequirementModal(requirement, index)
                }
                isActive={requirement.id === activeRequirementId}
              />
            ))}
          </Reorder.Group>
          {regulatoryConsideration && (
            <RequirementCard
              key={regulatoryConsideration.id}
              requirement={regulatoryConsideration}
              index={inspectionRequirements.length}
              onEdit={() =>
                handleOpenEditRequirementModal(
                  regulatoryConsideration,
                  undefined,
                  true
                )
              }
              isActive={regulatoryConsideration.id === activeRequirementId}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default InspectionRequirements;
