import { Box, DialogContent, Grid } from "@mui/material";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { StaffUser } from "@/models/Staff";
import { useStaffUsersData } from "@/hooks/useStaff";
import { BCDesignTokens } from "epic.theme";
import GridLabelValuePair from "../GridLabelValuePair";
import { ImageFormData, Image } from "@/models/Image";
import { useEffect, useMemo } from "react";

type ImageModalProps = {
  file?: File;
  onSubmit: (data: ImageFormData) => void;
  imageData?: Image;
};

const imageFormSchema = yup.object().shape({
  takenBy: yup.object<StaffUser>().nullable().required("Taken By is required"),
  caption: yup.string().nullable().required("Caption is required"),
});

type ImageSchemaType = yup.InferType<typeof imageFormSchema>;

const initFormData: ImageFormData = {
  takenBy: undefined,
  caption: "",
};

const ImageModal: React.FC<ImageModalProps> = ({
  file,
  onSubmit,
  imageData,
}) => {
  const { data: staffUserList } = useStaffUsersData();

  const defaultValues = useMemo<ImageFormData>(() => {
    return imageData
      ? {
          takenBy: imageData.takenBy,
          caption: imageData.caption,
        }
      : initFormData;
  }, [imageData]);

  const methods = useForm<ImageSchemaType>({
    resolver: yupResolver(imageFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: ImageSchemaType) => {
    const formData = data as ImageFormData;
    onSubmit(formData);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalTitleBar title={imageData ? "Edit Photo" : "Add Photo"} />
          <DialogContent dividers>
            <Box
              sx={{
                width: "100%",
                height: "300px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <img
                src={file ? URL.createObjectURL(file) : ""}
                alt="Preview"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
            </Box>
            <Grid
              container
              spacing={1}
              wrap="nowrap"
              sx={{
                padding: 1.5,
                borderRadius: 0.5,
                background: BCDesignTokens.surfaceColorBackgroundLightBlue,
                marginLeft: 0,
                width: "100%",
                my: 2,
              }}
            >
              <GridLabelValuePair
                label="Photo #"
                value={1}
                gridProps={{ xs: 2 }}
                isBold
              />
              <GridLabelValuePair
                label="File Name"
                value={file ? file.name : "No file selected"}
                gridProps={{ xs: 6 }}
                isBold
              />
              <GridLabelValuePair
                label="File Date"
                value={
                  file
                    ? new Date(file.lastModified).toLocaleDateString()
                    : "No file selected"
                }
                gridProps={{ xs: 4 }}
                isBold
              />
            </Grid>
            <ControlledAutoComplete
              name="takenBy"
              label="Taken By"
              options={staffUserList ?? []}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={!!imageData}
            />
            <ControlledTextField name="caption" label="Caption" fullWidth />
          </DialogContent>
          <ModalActions
            primaryActionButtonText={imageData ? "Save" : "Add"}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default ImageModal;
