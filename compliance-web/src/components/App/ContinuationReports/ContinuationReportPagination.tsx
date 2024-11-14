import {
  Box,
  Pagination,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { useMemo } from "react";

type ContinuationReportPaginationProps = {
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent) => void;
};

export default function ContinuationReportPagination({
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: ContinuationReportPaginationProps) {
  const displayedRows = useMemo(() => {
    const start = rowsPerPage * (page - 1) + 1;
    const end = Math.min(rowsPerPage * page, total);
    return `${start} - ${end}`;
  }, [rowsPerPage, page, total]);

  return (
    <Box display="flex" alignItems="baseline" justifyContent={"space-between"}>
      <Box display={"flex"} alignItems="baseline">
        <Select
          size="small"
          value={rowsPerPage.toString()}
          variant="outlined"
          onChange={onRowsPerPageChange}
          renderValue={() => displayedRows}
          sx={{
            backgroundColor: "transparent !important",
            height: "2rem",
            ".MuiSelect-icon": {
              display: "none",
            },
            ".MuiOutlinedInput-input": {
              paddingRight: "14px !important",
              fontSize: "14px",
            },
          }}
        >
          {[10, 20, 30].map((option) => (
            <MenuItem key={option} value={option}>
              {option} per page
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" mx={1}>
          of {total}
        </Typography>
      </Box>
      <Pagination
        count={Math.ceil(total / rowsPerPage)}
        page={page}
        onChange={onPageChange}
        showFirstButton
        showLastButton
        sx={{
          paddingTop: "1rem",
          maxWidth: "75%",
          overflowX: "scroll",
          ".MuiPagination-ul": {
            flexWrap: "nowrap",
          },
        }}
      />
    </Box>
  );
}
