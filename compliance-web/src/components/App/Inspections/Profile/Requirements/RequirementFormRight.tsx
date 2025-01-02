import { FC, useState } from "react";
import { Box, Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import RequirementSourceModal from "./RequirementSourceModal";
import { RequirementSourceFormData } from "@/models/InspectionRequirement";
import RequirementSourceCard from "./RequirementSourceCard";

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

  const handleAddRequirementSourceModal = () => {
    setOpen({
      content: <RequirementSourceModal onSubmit={handleOnAddSubmit} />,
      width: "640px",
    });
  };

  const handleEditRequirementSourceModal = (
    data: RequirementSourceFormData
  ) => {
    setOpen({
      content: (
        <RequirementSourceModal
          onSubmit={handleOnEditSubmit}
          requirementSourceData={data}
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
        onClick={handleAddRequirementSourceModal}
        startIcon={<AddRounded />}
      >
        Requirement Source
      </Button>
      {requirementSourceFormData.map((data, index) => (
        <RequirementSourceCard
          key={index}
          data={data}
          index={index}
          onEdit={handleEditRequirementSourceModal}
        />
      ))}
    </Box>
  );
};

export default RequirementFormRight;
