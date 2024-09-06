import { useModal } from "@/store/modalStore";
import { Button, DialogActions } from "@mui/material";
import { FC } from "react";
import { useFormContext } from "react-hook-form";

type ModalActionsProps = {
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  onPrimaryAction?: () => void;
  isButtonValidation?: boolean;
};

const ModalActions: FC<ModalActionsProps> = ({
  primaryActionButtonText,
  secondaryActionButtonText,
  onPrimaryAction,
  isButtonValidation,
}) => {
  const { setClose } = useModal();
  const formContext = useFormContext();

  const isValid = isButtonValidation ? formContext?.formState.isValid : true;

  return (
    <DialogActions sx={{ padding: "1rem 1.5rem" }}>
      <Button variant="text" onClick={setClose}>
        {secondaryActionButtonText ?? "Cancel"}
      </Button>
      <Button
        type={onPrimaryAction ? "button" : "submit"}
        onClick={onPrimaryAction}
        disabled={!!isButtonValidation && !isValid}
      >
        {primaryActionButtonText ?? "Ok"}
      </Button>
    </DialogActions>
  );
};

export default ModalActions;
