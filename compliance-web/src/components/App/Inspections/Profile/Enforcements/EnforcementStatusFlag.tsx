import { InspectionOrder } from "@/models/InspectionOrder";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import { OrderStatusEnum, WarningLetterStatusEnum } from "@/utils/constants";
import { Chip } from "@mui/material";

const EnforcementStatusFlag = ({
  order,
  warningLetter,
}: {
  order?: InspectionOrder;
  warningLetter?: InspectionWarningLetter;
}) => {
  return order?.order_status ? (
    (order.order_status.id === OrderStatusEnum.OPEN && (
      <Chip
        label={order?.order_status?.name ?? ""}
        color="success"
        size="small"
        variant="outlined"
      />
    )) ||
      ((order.order_status.id === OrderStatusEnum.CLOSED ||
        order.order_status.id === OrderStatusEnum.RESCINDED) && (
        <Chip
          label={order?.order_status?.name ?? ""}
          color="error"
          size="small"
          variant="outlined"
        />
      ))
  ) : warningLetter?.status &&
    warningLetter.status.id === WarningLetterStatusEnum.ISSUED ? (
    <Chip
      label={warningLetter?.status?.name ?? ""}
      color="success"
      size="small"
      variant="outlined"
    />
  ) : null;
};

export default EnforcementStatusFlag;
