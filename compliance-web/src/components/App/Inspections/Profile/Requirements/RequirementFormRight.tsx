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

  const handleOnSubmit = (data: RequirementSourceFormData) => {
    setClose();
    // eslint-disable-next-line no-console
    console.log(data);
    setRequirementSourceFormData((prevData) => [...prevData, data]);
  };

  const handleAddRequirementSourceModal = () => {
    setOpen({
      content: <RequirementSourceModal onSubmit={handleOnSubmit} />,
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
        <RequirementSourceCard key={index} data={data} index={index} />
      ))}
    </Box>
  );
};

export default RequirementFormRight;
