import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Typography } from "@mui/material";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import ControlledRadioButtonGroup from "@/components/Shared/Controlled/ControlledRadioButtonGroup";

const irVersionSelectFormSchema = yup.object().shape({
  versionSelection: yup.string().required("Version selection is required"),
});

type IRVersionSelectSchemaType = yup.InferType<
  typeof irVersionSelectFormSchema
>;

const initFormData: IRVersionSelectSchemaType = {
  versionSelection: "",
};

type IRVersionSelectProps = {
  onNext: () => void;
  onBack: () => void;
};

const IRVersionSelect: React.FC<IRVersionSelectProps> = ({
  onNext,
  onBack,
}) => {
  const defaultValues = useMemo<IRVersionSelectSchemaType>(() => {
    return initFormData;
  }, []);

  const methods = useForm<IRVersionSelectSchemaType>({
    resolver: yupResolver(irVersionSelectFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit } = methods;

  const onSubmitHandler = (data: IRVersionSelectSchemaType) => {
    // eslint-disable-next-line no-console
    console.log(data);
    // TODO: Update approvals with data
    onNext();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Typography variant="body2" mb={1}>
          Review the Regulated Party's response and decide how to proceed.
          Select whether to finalize the Inspection Record or conduct another
          round of Preliminary Review.
        </Typography>
        <ControlledRadioButtonGroup
          name="versionSelection"
          options={[
            { id: "final", name: "Proceed with Final IR" },
            { id: "preliminary", name: "Continue with Preliminary IR" },
          ]}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <Button variant="text" size="small" onClick={onBack}>
              Previous
            </Button>
            <Button variant="outlined" size="small" type="submit">
              Finish
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default IRVersionSelect;
