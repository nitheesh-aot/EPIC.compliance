import { FC, useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import EnforcementModal from "@/components/App/Inspections/Profile/Enforcements/EnforcementModal";
import { BaseEnforcementFormType, baseEnforcementSchema } from "@/components/App/Inspections/Profile/Enforcements/EnforcementUtils";
import { useCreateWarningLetter, useCreateWarningLetterApproval } from "@/hooks/useInspectionWarningLetters";
import {
  InspectionWarningLetter,
  InspectionWarningLetterAPIData,
} from "@/models/InspectionWarningLetter";
import { Inspection } from "@/models/Inspection";
import { InspectionRequirement } from "@/models/InspectionRequirement";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "@/store/snackbarStore";
import { WarningLetterApproval } from "@/models/WarningLetterApproval";

const initWarningLetterFormData: BaseEnforcementFormType = {
  requirements: [],
};

type WarningLetterCreateModalProps = {
  inspectionData: Inspection;
  requirementsList: InspectionRequirement[];
  requirement?: InspectionRequirement;
  onSubmit: (data: InspectionWarningLetter) => void;
};

const WarningLetterCreateModal: FC<WarningLetterCreateModalProps> = ({
  inspectionData,
  requirementsList,
  requirement,
  onSubmit,
}) => {
  const queryClient = useQueryClient();
  const defaultValues = useMemo(() => {
    if (requirement) {
      return {
        requirements: [requirement],
      };
    }
    return initWarningLetterFormData;
  }, [requirement]);

  const methods = useForm<BaseEnforcementFormType>({
    resolver: yupResolver(baseEnforcementSchema),
    mode: "onBlur",
    defaultValues,
  });

  const { reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onWarningLetterApprovalSuccess = async (data: WarningLetterApproval) => {
    await queryClient.invalidateQueries({
      queryKey: ["inspection-warning-letters", inspectionData.id],
    });
    const inspectionWarningLetters = queryClient.getQueryData<InspectionWarningLetter[]>([
      "inspection-warning-letters",
      inspectionData.id,
    ]);
    if (inspectionWarningLetters) {
      const warningLetter = inspectionWarningLetters.find(
        (warningLetter) => warningLetter.id === data.warning_letter_id
      );
      if (warningLetter) {
        notifyAndSubmit(warningLetter);
      }
    }
  };

  const { mutate: createWarningLetterApproval } = useCreateWarningLetterApproval(
    onWarningLetterApprovalSuccess
  );

  const onSuccess = (data: InspectionWarningLetter) => {
    if (inspectionData.is_history) {
      // create default order approval for historical records
      createWarningLetterApproval({
        inspectionWarningLetterId: data.id ?? 0,
        approvalPayload: {},
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ["inspection-warning-letters", inspectionData.id],
      });
      notifyAndSubmit(data);
    }
    onSubmit(data);
  };

  const notifyAndSubmit = (data: InspectionWarningLetter) => {
    notify.success(`Warning Letter ${data.warning_letter_number} created`);
    onSubmit(data);
  };

  const {
    mutate: createInspectionWarningLetter,
    isPending: isPendingWarningLetter,
  } = useCreateWarningLetter(onSuccess);

  const handleBaseSubmit = useCallback(
    (data: BaseEnforcementFormType) => {
      const warningLetterData: InspectionWarningLetterAPIData = {
        inspection_id: inspectionData?.id ?? 0,
        inspection_requirement_ids: (
          data.requirements as InspectionRequirement[]
        ).map((requirement) => requirement.id),
      };
      createInspectionWarningLetter({
        inspectionWarningLetter: warningLetterData,
      });
    },
    [createInspectionWarningLetter, inspectionData]
  );

  return (
    <FormProvider {...methods}>
      <EnforcementModal
        requirementsList={requirementsList}
        requirement={requirement}
        title="Create Warning Letter"
        onSubmit={handleBaseSubmit}
        isLoading={isPendingWarningLetter}
      />
    </FormProvider>
  );
};

export default WarningLetterCreateModal; 
