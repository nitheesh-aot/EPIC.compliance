import { Box } from "@mui/material";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { useEffect, useMemo } from "react";
import PopoverActions from "@/components/Shared/Popover/PopoverActions";

type MailingAddressPopoverProps = {
  onSubmit: (message: string) => void;
  mailingAddress?: string;
};

const mailingAddressFormSchema = yup.object().shape({
  mailingAddress: yup
    .string()
    .nullable()
    .required("Mailing Address is required"),
});

type MailingAddressSchemaType = yup.InferType<typeof mailingAddressFormSchema>;

const initFormData = {
  mailingAddress: "",
};

const MailingAddressPopover: React.FC<MailingAddressPopoverProps> = ({
  onSubmit,
  mailingAddress,
}) => {
  const defaultValues = useMemo(() => {
    return mailingAddress
      ? {
          mailingAddress: mailingAddress,
        }
      : initFormData;
  }, [mailingAddress]);

  const methods = useForm<MailingAddressSchemaType>({
    resolver: yupResolver(mailingAddressFormSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // const onSuccess = () => {
  //   if (mailingAddress) {
  //     onSubmit("Mailing Address updated successfully");
  //   } else {
  //     onSubmit("Mailing Address added successfully");
  //   }
  // };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmitHandler = (data: MailingAddressSchemaType) => {
    const formData = data as { mailingAddress: string };
    // eslint-disable-next-line no-console
    console.log(formData);
    onSubmit(formData.mailingAddress);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <Box display="flex" flexDirection="column" px={2} pt={2}>
            <ControlledTextField
              name="mailingAddress"
              label="Mailing Address"
              multiline
              fullWidth
              isRequired={true}
            />
          </Box>
          <PopoverActions
            primaryActionButtonText={mailingAddress ? "Save" : "Add"}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default MailingAddressPopover;
