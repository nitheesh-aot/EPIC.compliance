import { FC, useState } from "react";
import { Box, Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import RequirementSourceModal from "./RequirementSourceModal";
import {
  RequirementRelatedDocumentFormData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import RequirementSourceCard from "./RequirementSourceCard";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import RequirementRelatedDocumentModal from "./RequirementRelatedDocumentModal";

const RequirementFormRight: FC = () => {
  const { setOpen, setClose } = useModal();
  const [requirementSourceFormData, setRequirementSourceFormData] = useState<
    RequirementSourceFormData[]
  >([]);

  const handleOnAddSubmit = (data: RequirementSourceFormData) => {
    setRequirementSourceFormData((prevData) => [...prevData, data]);
    setClose();
  };

  const handleOnEditSubmit = (data: RequirementSourceFormData) => {
    setRequirementSourceFormData((prevData) =>
      prevData.map((item) =>
        item.id === data.id ? { ...item, ...data } : item
      )
    );
    setClose();
  };

  const handleOnDeleteSubmit = (data: RequirementSourceFormData) => {
    setRequirementSourceFormData((prevData) =>
      prevData.filter((item) => item.id !== data.id)
    );
    setClose();
  };

  const handleOnAddRelatedDocumentSubmit = (
    data: RequirementRelatedDocumentFormData
  ) => {
    setRequirementSourceFormData((prevData) => {
      const updatedData = prevData.map((item) => {
        if (item.id === data.sourceFormId) {
          return {
            ...item,
            relatedDocuments: item.relatedDocuments
              ? [...item.relatedDocuments, data]
              : [data],
          };
        }
        return item;
      });
      return updatedData;
    });
    setClose();
  };

  const handleAddRequirementSource = () => {
    setOpen({
      content: <RequirementSourceModal onSubmit={handleOnAddSubmit} />,
      width: "640px",
    });
  };

  const handleEditRequirementSource = (data: RequirementSourceFormData) => {
    setOpen({
      content: (
        <RequirementSourceModal
          onSubmit={handleOnEditSubmit}
          requirementSourceFormData={data}
        />
      ),
      width: "640px",
    });
  };

  const handleDeleteRequirementSource = (data: RequirementSourceFormData) => {
    setOpen({
      content: (
        <ConfirmationModal
          title="Delete Requirement Source?"
          description={`You are about to delete ${data.requirementSource?.name}.
          This is the primary requirement source. 
          Deleting it will also permanently remove all associated documents. 
          Are you sure you want to proceed?`}
          confirmButtonText="Delete"
          onConfirm={() => handleOnDeleteSubmit(data)}
        />
      ),
    });
  };

  const handleAddRequirementSourceSection = (
    data: RequirementSourceFormData
  ) => {
    setOpen({
      content: (
        <RequirementSourceModal
          onSubmit={handleOnAddSubmit}
          requirementSource={data.requirementSource}
        />
      ),
      width: "640px",
    });
  };

  const handleAddRequirementRelatedDocument = (
    data: RequirementSourceFormData
  ) => {
    setOpen({
      content: (
        <RequirementRelatedDocumentModal
          onSubmit={handleOnAddRelatedDocumentSubmit}
          requirementSourceFormData={data}
        />
      ),
      width: "640px",
    });
  };

  // Grouping the requirementSourceFormData by requirementSource
  const groupedData = requirementSourceFormData.reduce(
    (acc, item) => {
      const sourceId = item.requirementSource?.id;
      if (sourceId === undefined) {
        return acc;
      }
      if (!acc[sourceId]) {
        acc[sourceId] = [];
      }
      acc[sourceId].push(item);
      return acc;
    },
    {} as { [key: string]: RequirementSourceFormData[] }
  );

  return (
    <Box
      sx={{
        padding: "1.5rem 1rem",
        width: "510px",
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      <Button
        color="secondary"
        onClick={handleAddRequirementSource}
        startIcon={<AddRounded />}
      >
        Requirement Source
      </Button>
      {Object.entries(groupedData).map(([sourceId, items], index) => (
        <RequirementSourceCard
          key={sourceId}
          data={items}
          index={index}
          onEdit={handleEditRequirementSource}
          onDelete={handleDeleteRequirementSource}
          onAddSection={handleAddRequirementSourceSection}
          onAddRelatedDocument={handleAddRequirementRelatedDocument}
        />
      ))}
    </Box>
  );
};

export default RequirementFormRight;
