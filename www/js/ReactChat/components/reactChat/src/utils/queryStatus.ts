// No data and no error yet; v4 `isLoading` / v5 `isPending`, which differ in name across versions.
export const isQueryPending = (query: { isSuccess: boolean; isError: boolean }): boolean =>
  !query.isSuccess && !query.isError;
