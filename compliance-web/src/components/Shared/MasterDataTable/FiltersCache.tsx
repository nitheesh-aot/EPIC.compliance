import { useEffect, useRef } from "react";
import { MRT_TableInstance, MRT_RowData } from "material-react-table";
import isEqual from "lodash/isEqual";
import { MasterTableColumnFilter } from "@/components/Shared/FilterSelect/type";

export const FiltersCache = <TData extends MRT_RowData>({
  onCacheFilters,
  table,
}: {
  onCacheFilters: (columnFilters: MasterTableColumnFilter[]) => void;
  table: MRT_TableInstance<TData>;
}) => {
  const prevFilters = useRef(table.getState().columnFilters);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const checkFilters = () => {
      const currentFilters = table.getState().columnFilters;

      if (!isEqual(prevFilters.current, currentFilters)) {
        prevFilters.current = currentFilters;
        onCacheFilters(currentFilters);
      }

      // Schedule next check
      animationFrameRef.current = requestAnimationFrame(checkFilters);
    };

    // Start checking
    animationFrameRef.current = requestAnimationFrame(checkFilters);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onCacheFilters, table]);

  return null;
};
