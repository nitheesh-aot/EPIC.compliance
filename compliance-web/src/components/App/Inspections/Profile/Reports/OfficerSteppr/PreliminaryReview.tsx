import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import ControlledDateField from "@/components/Shared/Controlled/ControlledDateField";

const preliminaryReviewFormSchema = yup.object().shape({
  dateSent: yup
    .mixed<Dayjs>()
    .required("Date Report Sent is required")
    .typeError("Invalid date"),
  dueDate: yup
    .mixed<Dayjs>()
    .required("Due Date is required")
    .typeError("Invalid date"),
});

type PreliminaryReviewSchemaType = yup.InferType<
  typeof preliminaryReviewFormSchema
>;

const initFormData: PreliminaryReviewSchemaType = {
  dateSent: undefined as unknown as Dayjs,
  dueDate: undefined as unknown as Dayjs,
};

type PreliminaryReviewProps = {
  onNext: () => void;
};

const PreliminaryReview: React.FC<PreliminaryReviewProps> = ({ onNext }) => {
  const defaultValues = useMemo<PreliminaryReviewSchemaType>(() => {
    return initFormData;
  }, []);

  const methods = useForm<PreliminaryReviewSchemaType>({
    resolver: yupResolver(preliminaryReviewFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, watch, setValue, clearErrors } = methods;

  // Watch for changes in dateSent
  const dateSent = watch("dateSent");

  // Update dueDate when dateSent changes
  useEffect(() => {
    if (dateSent) {
      // Add 5 days to dateSent
      const calculatedDueDate = dayjs(dateSent).add(5, "day");
      setValue("dueDate", calculatedDueDate);

      // Clear any existing errors for dueDate
      clearErrors("dueDate");
    }
  }, [dateSent, setValue, clearErrors]);

  const onSubmitHandler = (data: PreliminaryReviewSchemaType) => {
    // eslint-disable-next-line no-console
    console.log(data);
    // TODO: Update approvals with data
    onNext();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Typography variant="body2">
          Please enter the date the report was sent to the regulated party. The
          system will automatically set a 5 business expected return day for
          you. Adjust if needed.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <ControlledDateField
              name="dateSent"
              label="Date Report Sent"
              height="2rem"
              isRequired={true}
            />
            <ControlledDateField
              name="dueDate"
              label="Due Date"
              height="2rem"
              isRequired={true}
            />
          </Box>
          <Button variant="outlined" size="small" type="submit">
            Next
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default PreliminaryReview;
