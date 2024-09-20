import { FC } from "react";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";

const ContactForm: FC = () => {
  return (
    <>
      <ControlledTextField
        name="contactFullName"
        label="Full Name (optional)"
        fullWidth
      />
      <ControlledTextField
        name="contactEmail"
        label="Email (optional)"
        placeholder="example@example.com"
        fullWidth
      />
      <ControlledTextField
        name="contactPhoneNumber"
        label="Phone Number (optional)"
        mask="(000) 000-0000"
        placeholder="(xxx) xxx-xxxx"
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
