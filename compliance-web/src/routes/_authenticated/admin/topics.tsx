import TopicModal from '@/components/App/Agencies/AgencyModal';
import MasterDataTable from '@/components/Shared/MasterDataTable/MasterDataTable';
import { searchFilter } from '@/components/Shared/MasterDataTable/utils';
import ConfirmationModal from '@/components/Shared/Popups/ConfirmationModal';
import { useAgenciesData, useDeleteAgency } from '@/hooks/useAgencies';
import { useTopicsData } from '@/hooks/useTopics';
import { Agency } from '@/models/Agency';
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

  const columns = useMemo<MRT_ColumnDef<Agency>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        size: 450,
      },
      {
        accessorKey: "abbreviation",
        header: "Abbreviation",
        sortingFn: "sortFn",
        filterFn: searchFilter,
        size: 200,
      },
    ],
    []
  );

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["agencies"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenModal = () => {
    setOpen({
      content: <TopicModal onSubmit={handleOnSubmit} />,
      width: TOPIC_MODAL_WIDTH,
    });
  };

  const handleEdit = (agency: Agency) => {
    setOpen({
      content: <TopicModal onSubmit={handleOnSubmit} topic={agency} />,
      width: TOPIC_MODAL_WIDTH,
    });
  };

  /** Agency Deletion START */

  const onDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["agencies"] });
    setClose();
    notify.success("Agency deleted successfully!");
  };

  const onDeleteError = (error: AxiosError) => {
    notify.error(`Agency deletion failed! ${error.message}`);
  };

  const { mutate: deleteUser } = useDeleteAgency(
    onDeleteSuccess,
    onDeleteError
  );

  const handleDelete = (id: number) => {
    setOpen({
      content: (
        <ConfirmationModal
          title="Delete Agency?"
          description="You are about to delete this Agency. Are you sure?"
          confirmButtonText="Delete"
          onConfirm={() => handleDeleteUser(id)}
        />
      ),
    });
  };

  const handleDeleteUser = (id: number) => {
    if (id !== null) {
      deleteUser(id);
    }
  };

  /** Agency Deletion END */

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
            <IconButton
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
            </IconButton>
          </Box>
        )}
        titleToolbarProps={{
          tableTitle: "Agencies",
          tableAddRecordButtonText: "Agency",
          tableAddRecordFunction: () => handleOpenModal(),
        }}
      />
    </>
  );
}
