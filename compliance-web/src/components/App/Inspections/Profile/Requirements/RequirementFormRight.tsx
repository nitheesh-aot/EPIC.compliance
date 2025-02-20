import { FC, useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useModal } from "@/store/modalStore";
import RequirementSourceModal from "./RequirementSourceModal";
import {
  RequirementRelatedDocumentData,
  RequirementRelatedDocumentSectionData,
  RequirementSourceFormData,
} from "@/models/InspectionRequirement";
import RequirementSourceCard from "./RequirementSourceCard";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import RequirementRelatedDocumentModal from "./RequirementRelatedDocumentModal";
import { isRequirementSourceCondition } from "./RequirementUtils";
import ImagesContainer from "./Images/ImagesContainer";
import { ImageTypeEnum } from "./RequirementUtils";

interface RequirementFormRightProps {
  onDataChange: (data: RequirementSourceFormData[]) => void;
  requirementSourceFormDataList: RequirementSourceFormData[];
}

const RequirementFormRight: FC<RequirementFormRightProps> = ({
  onDataChange,
  requirementSourceFormDataList,
}) => {
  const { setOpen, setClose } = useModal();
  const [requirementSourceFormData, setRequirementSourceFormData] = useState<
    RequirementSourceFormData[]
  >(requirementSourceFormDataList);

  useEffect(() => {
    onDataChange(requirementSourceFormData);
  }, [requirementSourceFormData, onDataChange]);

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
    data: RequirementRelatedDocumentData
  ) => {
    setRequirementSourceFormData((prevData) => {
      const updatedData = prevData.map((item) => {
        if (item.id === data.sourceFormId) {
          const existingDocumentIndex = item.relatedDocuments?.findIndex(
            (doc) => doc.id === data.id
          );
          if (
            item.relatedDocuments &&
            existingDocumentIndex !== undefined &&
            existingDocumentIndex >= 0
          ) {
            item.relatedDocuments[existingDocumentIndex] = data;
          } else {
            if (!item.relatedDocuments) {
              item.relatedDocuments = [];
            }
            item.relatedDocuments.push(data);
          }
          return item;
        }
        return item;
      });
      return updatedData;
    });
    setClose();
  };

  const handleOnDeleteRelatedDocumentSectionSubmit = (
    data: RequirementRelatedDocumentSectionData
  ) => {
    setRequirementSourceFormData((prevData) =>
      prevData.map((item) => {
        if (item.id === data.sourceFormId) {
          return {
            ...item,
            relatedDocuments: item.relatedDocuments
              ?.map((doc) => {
                if (doc.id === data.relatedDocumentFormId) {
                  const updatedSections = doc.sections?.filter(
                    (section) => section.id !== data.id
                  );
                  return updatedSections?.length === 0
                    ? null
                    : { ...doc, sections: updatedSections };
                }
                return doc;
              })
              .filter((doc) => doc !== null),
          };
        }
        return item;
      })
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
    const isLastSectionItem =
      groupedData[data.requirementSource?.id ?? ""].length === 1;
    const sourceType = isRequirementSourceCondition(
      data.requirementSource?.id ?? ""
    )
      ? "condition"
      : "section";
    const description = isLastSectionItem
      ? `You are about to delete ${data.requirementSource?.name}.
      This is the primary requirement source. 
      Deleting it will also permanently remove all associated documents. 
      Are you sure you want to proceed?`
      : data.relatedDocuments?.length
        ? `You are about to delete ${data.sourceNumber} - ${data.sourceTitle}.
        This ${sourceType} has associated documents.
        Deleting this ${sourceType} will also remove all associated documents from the system.
        Are you sure you want to proceed?`
        : `You are about to delete ${data.sourceNumber} - ${data.sourceTitle}.
        Are you sure you want to proceed?`;
    setOpen({
      content: (
        <ConfirmationModal
          title="Delete Requirement Source?"
          description={description}
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
          requirementSourceData={data}
        />
      ),
      width: "640px",
    });
  };

  const handleAddRelatedDocumentSection = (
    docData: RequirementRelatedDocumentData,
    srcData: RequirementSourceFormData
  ) => {
    setOpen({
      content: (
        <RequirementRelatedDocumentModal
          onSubmit={handleOnAddRelatedDocumentSubmit}
          requirementSourceData={srcData}
          relatedDocumentData={docData}
        />
      ),
      width: "640px",
    });
  };

  const filterSourceData = (data: RequirementRelatedDocumentSectionData) => {
    const srcData = requirementSourceFormData.find(
      (item) => item.id === data.sourceFormId
    );
    const docData = srcData?.relatedDocuments?.find(
      (doc) => doc.id === data.relatedDocumentFormId
    );
    return { srcData, docData };
  };

  const handleEditRelatedDocumentSection = (
    data: RequirementRelatedDocumentSectionData
  ) => {
    const { srcData, docData } = filterSourceData(data);

    setOpen({
      content: (
        <RequirementRelatedDocumentModal
          onSubmit={handleOnAddRelatedDocumentSubmit}
          requirementSourceData={srcData!}
          relatedDocumentData={docData!}
          relatedDocumentSectionData={data}
          isEditSection={true}
        />
      ),
      width: "640px",
    });
  };

  const handleDeleteRequirementRelatedDocumentSection = (
    data: RequirementRelatedDocumentSectionData
  ) => {
    const { docData } = filterSourceData(data);
    const description = `You are about to delete this section: #${data.sectionNumber} - ${data.sectionTitle}.
    ${docData?.sections?.length === 1 ? "This will result in deleting the whole document." : ""}
    Are you sure you want to proceed?`;
    setOpen({
      content: (
        <ConfirmationModal
          title="Delete Section?"
          description={description}
          confirmButtonText="Delete"
          onConfirm={() => handleOnDeleteRelatedDocumentSectionSubmit(data)}
        />
      ),
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
      <ImagesContainer imageType={ImageTypeEnum.PHOTO} />
      <ImagesContainer imageType={ImageTypeEnum.FIGURE} />
      {Object.entries(groupedData).map(([sourceId, items], index) => (
        <RequirementSourceCard
          key={sourceId}
          data={items}
          index={index}
          onEdit={handleEditRequirementSource}
          onDelete={handleDeleteRequirementSource}
          onAddSection={handleAddRequirementSourceSection}
          onAddRelatedDocument={handleAddRequirementRelatedDocument}
          onAddRelatedDocumentSection={handleAddRelatedDocumentSection}
          onEditRelatedDocumentSection={handleEditRelatedDocumentSection}
          onDeleteRelatedDocumentSection={
            handleDeleteRequirementRelatedDocumentSection
          }
        />
      ))}
    </Box>
  );
};

export default RequirementFormRight;
