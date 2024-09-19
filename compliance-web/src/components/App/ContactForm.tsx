import { FC } from "react";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";

const ContactForm: FC = () => {
  return (
    <>
      <ControlledTextField
        name="contactFullName"
        label="Full Name (optional)"
        multiline
        fullWidth
      />
      <ControlledTextField
        name="contactEmail"
        label="Email (optional)"
        multiline
        fullWidth
      />
      <ControlledTextField
        name="contactPhoneNumber"
        label="Phone Number (optional)"
        mask="(000) 000-0000"
        multiline
        fullWidth
      />
      <ControlledTextField
        name="contactComments"
        label="Comments (optional)"
        multiline
        fullWidth
      />
    </>
  );
};

export default ContactForm;
