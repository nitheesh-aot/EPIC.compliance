import TopicModal from '@/components/App/Topics/TopicModal';
import MasterDataTable from '@/components/Shared/MasterDataTable/MasterDataTable';
import { searchFilter } from '@/components/Shared/MasterDataTable/utils';
import ConfirmationModal from '@/components/Shared/Popups/ConfirmationModal';
import { useDeleteTopic, useTopicsData } from '@/hooks/useTopics';
import { Topic } from '@/models/Topic';
import { useModal } from '@/store/modalStore';
import { notify } from '@/store/snackbarStore';
import { EditOutlined, DeleteOutlineRounded } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { AxiosError } from 'axios';
import { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';

export const Route = createFileRoute('/_authenticated/admin/topics')({
  component: Topics
})

const TOPIC_MODAL_WIDTH = "520px";

export function Topics() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();

  const { data: topicsList, isLoading } = useTopicsData();

  const columns = useMemo<MRT_ColumnDef<Topic>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "sortFn",
        // filterFn: searchFilter,
      },
    ],
    []
  );

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["topics"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenModal = () => {
    setOpen({
      content: <TopicModal onSubmit={handleOnSubmit} />,
      width: TOPIC_MODAL_WIDTH,
    });
  };

  const handleEdit = (topic: Topic) => {
    setOpen({
      content: <TopicModal onSubmit={handleOnSubmit} topic={topic} />,
      width: TOPIC_MODAL_WIDTH,
    });
  };

  /** Topic Deletion START */

  const onDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["topics"] });
    setClose();
    notify.success("Topic deleted successfully!");
  };

  const onDeleteError = (error: AxiosError) => {
    notify.error(`Topic deletion failed! ${error.message}`);
  };

  const { mutate: deleteTopic } = useDeleteTopic(
    onDeleteSuccess,
    onDeleteError
  );

  const handleDelete = (id: number) => {
    setOpen({
      content: (
        <ConfirmationModal
          title="Delete Topic?"
          description="You are about to delete this topic. Are you sure?"
          confirmButtonText="Delete"
          onConfirm={() => handleDeleteTopic(id)}
        />
      ),
    });
  };

  const handleDeleteTopic = (id: number) => {
    if (id !== null) {
      deleteTopic(id);
    }
  };

  /** Topic Deletion END */

  return (
    <>
      <MasterDataTable
        columns={columns}
        data={topicsList ?? []}
        initialState={{
          sorting: [
            {
              id: "name",
              desc: false,
            },
          ],
        }}
        state={{
          isLoading: isLoading,
          showGlobalFilter: true,
        }}
        enableRowActions={true}
        renderRowActions={({ row }) => (
          <Box gap={".25rem"} display={"flex"}>
            {/* <IconButton
              aria-label="edit"
              onClick={() => handleEdit(row.original)}
            >
              <EditOutlined />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => handleDelete(row.original.id)}
            >
              <DeleteOutlineRounded />
            </IconButton> */}
          </Box>
        )}
        titleToolbarProps={{
          tableTitle: "Topics",
          tableAddRecordButtonText: "Topic",
          tableAddRecordFunction: () => handleOpenModal(),
        }}
      />
    </>
  );
}
