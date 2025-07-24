import { InspectionOrder } from "@/models/InspectionOrder";
import { InspectionWarningLetter } from "@/models/InspectionWarningLetter";
import {
  APPROVAL_STATUS,
  OrderProgressEnum,
  OrderStatusEnum,
  VARIANT_COLORS,
  WarningLetterProgressEnum,
} from "@/utils/constants";
import { Chip } from "@mui/material";
import { useMemo } from "react";

const EnforcementStatusFlag = ({
  order,
  warningLetter,
}: {
  order?: InspectionOrder;
  warningLetter?: InspectionWarningLetter;
}) => {
  const flagStatus = useMemo(() => {
    let status: {
      name: string;
      color?: VARIANT_COLORS;
    } = {
      name: "",
      color: "default",
    };
    if (order?.order_progress) {
      status = {
        name: order.order_progress.name,
      };
      if (order.order_progress.id === OrderProgressEnum.APPROVED) {
        status.color = "success";
      } else if (order.order_progress.id === OrderProgressEnum.DEPUTY_REVIEW) {
        status.color = "warning";
      } else if (order.order_progress.id === OrderProgressEnum.ISSUED) {
        status.name = "Open";
        status.color = "success";
        if (
          order.order_status?.id === OrderStatusEnum.CLOSED ||
          order.order_status?.id === OrderStatusEnum.RESCINDED
        ) {
          status.name = order.order_status.name;
          status.color = "error";
        }
      } else if (
        order.order_progress.id === OrderProgressEnum.DRAFTING &&
        order.order_approvals?.[0]?.approval_status.id ===
          APPROVAL_STATUS.NOT_APPROVED
      ) {
        status.name = "Not Approved";
        status.color = "error";
      }
    } else if (warningLetter?.progress) {
      status = {
        name: warningLetter.progress.name,
      };
      if (warningLetter.progress.id === WarningLetterProgressEnum.APPROVED) {
        status.color = "success";
      } else if (
        warningLetter.progress.id === WarningLetterProgressEnum.DEPUTY_REVIEW
      ) {
        status.color = "warning";
      } else if (
        warningLetter.progress.id === WarningLetterProgressEnum.ISSUED
      ) {
        status.color = "success";
      } else if (
        warningLetter.progress.id === WarningLetterProgressEnum.DRAFTING &&
        warningLetter.warning_letter_approvals?.[0]?.approval_status.id ===
          APPROVAL_STATUS.NOT_APPROVED
      ) {
        status.name = "Not Approved";
        status.color = "error";
      }
    }
    return status;
  }, [order, warningLetter]);

  return flagStatus.name ? (
    <Chip
      label={flagStatus.name}
      color={flagStatus.color}
      size="small"
      variant="outlined"
    />
  ) : null;
};

export default EnforcementStatusFlag;
