import { DialogContent } from "@mui/material";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { notify } from "@/store/snackbarStore";
import { AxiosError } from "axios";
import ModalTitleBar from "@/components/Shared/Modals/ModalTitleBar";
import ModalActions from "@/components/Shared/Modals/ModalActions";
import { useEffect } from "react";
import { Topic } from "@/models/Topic";
import { useAddTopic, useUpdateTopic } from "@/hooks/useTopics";

type TopicModalProps = {
  onSubmit: (submitMsg: string) => void;
  topic?: Topic;
};

const topicSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Max length exceeded"),
});

type TopicForm = yup.InferType<typeof topicSchema>;

const TopicModal: React.FC<TopicModalProps> = ({ onSubmit, topic }) => {
  const onSuccess = () => {
    onSubmit(topic ? "Successfully updated!" : "Successfully added!");
  };

  const onError = (err: AxiosError) => {
    notify.error(err?.message);
  };

  const { mutate: addTopic } = useAddTopic(onSuccess, onError);
  const { mutate: updateTopic } = useUpdateTopic(onSuccess, onError);

  const methods = useForm({
    resolver: yupResolver(topicSchema),
    mode: "onBlur",
    defaultValues: topic,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(topic);
  }, [topic, reset]);

  const onSubmitHandler = async (data: TopicForm) => {
    const topicData = {
      name: data.name,
    };
    if (topic) {
      updateTopic({ id: topic.id, topic: topicData });
    } else {
      addTopic(topicData);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <ModalTitleBar title={topic ? topic.name : "Add Topic"} />
        <DialogContent dividers>
          <ControlledTextField label="Topic" name="name" fullWidth />
        </DialogContent>
        <ModalActions primaryActionButtonText={topic ? "Save" : "Add"} />
      </form>
    </FormProvider>
  );
};

export default TopicModal;
