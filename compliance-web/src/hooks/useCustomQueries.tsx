import { useQuery, QueryFunction, QueryKey } from "@tanstack/react-query";

export const useStaticQuery = <TData = unknown, TError = unknown>({
  queryKey,
  queryFn,
}: {
  queryKey: string[];
  queryFn: QueryFunction<TData, QueryKey>;
}) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
