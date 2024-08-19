import { useModal } from "@/store/modalStore";
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Divider,
  Box,
} from "@mui/material";

type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmButtonText?: string;
  width?: number;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  description,
  confirmButtonText,
  width,
  onConfirm,
}) => {
  const { setClose } = useModal();
  return (
    <Box width={width ?? 400}>
      <DialogTitle>{title}</DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ padding: "1rem" }}>
        <Button onClick={setClose} color="primary" variant="text">
          Cancel
        </Button>
        <Button onClick={onConfirm}>
          {confirmButtonText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ConfirmationModal;
