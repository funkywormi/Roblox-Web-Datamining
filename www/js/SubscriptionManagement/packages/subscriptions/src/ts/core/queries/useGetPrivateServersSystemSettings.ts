import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { privateServersApi } from "../services/privateServerServices";
import { DEFAULT_RETRIES, privateServerKeys } from "./constants";

type PrivateServersSystemSettingsResponse = Awaited<
  ReturnType<typeof privateServersApi.privateServersGetPrivateServersSystemSettings>
>;

type Options<TData = PrivateServersSystemSettingsResponse> = Omit<
  UseQueryOptions<PrivateServersSystemSettingsResponse, Error, TData>,
  "queryKey" | "queryFn"
>;

export function useGetPrivateServersSystemSettings(options: Options = {}) {
  return useQuery<PrivateServersSystemSettingsResponse, Error>({
    queryKey: privateServerKeys.systemSettings(),
    queryFn: ({ signal }) =>
      privateServersApi.privateServersGetPrivateServersSystemSettings(undefined, { signal }),
    retry: DEFAULT_RETRIES,
    ...options,
  });
}
