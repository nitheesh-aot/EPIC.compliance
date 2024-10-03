import { DialogContent, DialogContentText } from "@mui/material";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";

type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
}) => {
  return (
    <>
      <ModalTitleBar title={title} onClose={onCancel} />
      <DialogContent dividers>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <ModalActions
        primaryActionButtonText={confirmButtonText}
        secondaryActionButtonText={cancelButtonText}
        onPrimaryAction={onConfirm}
        onSecondaryAction={onCancel}
      />
    </>
  );
};

export default ConfirmationModal;
