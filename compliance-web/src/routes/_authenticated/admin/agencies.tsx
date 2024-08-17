import AgencyModal from '@/components/App/Agencies/AgencyModal';
import MasterDataTable from '@/components/Shared/MasterDataTable/MasterDataTable';
import { searchFilter } from '@/components/Shared/MasterDataTable/utils';
import { useAgenciesData } from '@/hooks/useAgencies';
import { Agency } from '@/models/Agency';
import { useModal } from '@/store/modalStore';
import { notify } from '@/store/snackbarStore';
import { EditOutlined, DeleteOutlineRounded, AddRounded } from '@mui/icons-material';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { BCDesignTokens } from 'epic.theme';
import { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';

export const Route = createFileRoute('/_authenticated/admin/agencies')({
  component: Agencies
})

function Agencies() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useModal();
  const { data: agenciesList, isLoading } = useAgenciesData();

  const columns = useMemo<MRT_ColumnDef<Agency>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "abbreviation",
        header: "Abbreviation",
        sortingFn: "sortFn",
        filterFn: searchFilter,
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
    setOpen(<AgencyModal onSubmit={handleOnSubmit} />);
  };

  const handleDelete = (id: number) => {
    // TODO: DELETE
    // eslint-disable-next-line no-console
    console.log(id);
  };

  const handleEdit = (agency: Agency) => {
    setOpen(<AgencyModal onSubmit={handleOnSubmit} agency={agency} />);
  };

  return (
    <>
      <MasterDataTable
        columns={columns}
        data={agenciesList ?? []}
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
        renderTopToolbarCustomActions={() => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: BCDesignTokens.typographyColorLink }}
            >
              Agencies
            </Typography>
            <Button
              startIcon={<AddRounded />}
              onClick={() => handleOpenModal()}
            >
              Agency
            </Button>
          </Box>
        )}
      />
    </>
  );
}
