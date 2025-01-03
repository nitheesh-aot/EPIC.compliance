import { FC, useState } from "react";
import { Box, Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import RequirementSourceModal from "./RequirementSourceModal";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import RequirementSourceCard from "./RequirementSourceCard";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";

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
      {requirementSourceFormData.map((data, index) => (
        <RequirementSourceCard
          key={index}
          data={data}
          index={index}
          onEdit={handleEditRequirementSource}
          onDelete={handleDeleteRequirementSource}
          onAddSection={handleAddRequirementSourceSection}
        />
      ))}
    </Box>
  );
};

export default RequirementFormRight;
