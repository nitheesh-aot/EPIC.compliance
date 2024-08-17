import AgencyModal from "@/components/App/Agencies/AgencyModal";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { useAgenciesData, useDeleteAgency } from "@/hooks/useAgencies";
import { Agency } from "@/models/Agency";
import { useModal } from "@/store/modalStore";
import { notify } from "@/store/snackbarStore";
import {
  EditOutlined,
  DeleteOutlineRounded,
  AddRounded,
} from "@mui/icons-material";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { BCDesignTokens } from "epic.theme";
import { MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/admin/agencies")({
  component: Agencies,
});

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

  const handleEdit = (agency: Agency) => {
    setOpen(<AgencyModal onSubmit={handleOnSubmit} agency={agency} />);
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
    setOpen(
      <ConfirmationModal
        title="Delete Agency?"
        description="You are about to delete this Agency. Are you sure?"
        confirmButtonText="Delete"
        onConfirm={() => handleDeleteUser(id)}
      />
    );
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
