import { useModal } from "@/store/modalStore";
import { Button, DialogActions } from "@mui/material";
import { FC } from "react";

type ModalActionsProps = {
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  onPrimaryAction?: () => void;
};

const ModalActions: FC<ModalActionsProps> = ({
  primaryActionButtonText,
  secondaryActionButtonText,
  onPrimaryAction,
}) => {
  const { setClose } = useModal();

  return (
    <DialogActions sx={{ padding: "1rem 1.5rem" }}>
      <Button variant="text" onClick={setClose}>
        {secondaryActionButtonText ?? "Cancel"}
      </Button>
      <Button
        type={onPrimaryAction ? "button" : "submit"}
        onClick={onPrimaryAction}
      >
        {primaryActionButtonText ?? "Ok"}
      </Button>
    </DialogActions>
  );
};

export default ModalActions;
