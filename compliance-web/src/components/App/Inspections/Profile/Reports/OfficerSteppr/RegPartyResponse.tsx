import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Typography } from "@mui/material";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { Dayjs } from "dayjs";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";
import ControlledRadioButtonGroup from "@/components/Shared/Controlled/ControlledRadioButtonGroup";

const regPartyResponseFormSchema = yup.object().shape({
  responseReceived: yup.string().required("Response selection is required"),
  responseDate: yup.mixed<Dayjs>().when("responseReceived", {
    is: "yes",
    then: (schema) =>
      schema.required("Date Received is required").typeError("Invalid date"),
    otherwise: (schema) => schema.nullable(),
  }),
});

type RegPartyResponseSchemaType = yup.InferType<
  typeof regPartyResponseFormSchema
>;

const initFormData: RegPartyResponseSchemaType = {
  responseReceived: "",
  responseDate: undefined as unknown as Dayjs,
};

type RegPartyResponseProps = {
  onNext: () => void;
  onBack: () => void;
};

const RegPartyResponse: React.FC<RegPartyResponseProps> = ({
  onNext,
  onBack,
}) => {
  const defaultValues = useMemo<RegPartyResponseSchemaType>(() => {
    return initFormData;
  }, []);

  const methods = useForm<RegPartyResponseSchemaType>({
    resolver: yupResolver(regPartyResponseFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, watch } = methods;

  const responseReceived = watch("responseReceived");

  const onSubmitHandler = (data: RegPartyResponseSchemaType) => {
    // eslint-disable-next-line no-console
    console.log(data);
    // TODO: Update approvals with data
    onNext();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Typography variant="body2" mb={1}>
          Have you received a response from Regulated Party (RP)?
        </Typography>
        <ControlledRadioButtonGroup
          name="responseReceived"
          options={[
            { id: "yes", name: "Yes, PR provided response" },
            { id: "no", name: "No, RP didn’t provide a response" },
          ]}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: responseReceived === "yes" ? "space-between" : "flex-end",
            alignItems: "center",
            gap: 1,
            mt: 2,
          }}
        >
          {responseReceived === "yes" && (
            <ControlledDateField
              name="responseDate"
              label="Preliminary IR Response Date"
              height="2rem"
            />
          )}
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
              Next
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default RegPartyResponse;
