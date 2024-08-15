import { useEffect } from "react";
import { MRT_TableInstance, MRT_RowData } from "material-react-table";

export const FiltersCache = <TData extends MRT_RowData>({
  onCacheFilters,
  table,
}: {
  onCacheFilters: (columnFilters: unknown) => void;
  table: MRT_TableInstance<TData>;
}) => {
  useEffect(() => {
    onCacheFilters(table.getState().columnFilters);
  }, [onCacheFilters, table]);
  return null;
};
