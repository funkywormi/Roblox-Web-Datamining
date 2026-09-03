import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { UrlConfig } from "@rbx/core-scripts/http";
import { apiSet } from "../core/constants/services";
import { C3ChatConfigService } from "../core/types/serviceResponse";
import { SupportContextKey } from "../core/types/common";
import { C3ChatMetadataPayload } from "../core/types/c3Chat";

const API_TIMEOUT = 10000;

const useGetC3ChatConfigPayload = (chatConfigId?: string): C3ChatConfigService => {
  const isQueryEnabled = Boolean(chatConfigId);

  const fetchChatConfigPayload = async (): Promise<C3ChatMetadataPayload> => {
    const config: UrlConfig = {
      url: apiSet.fetchC3ChatConfigPayload.url,
      timeout: API_TIMEOUT,
      retryable: true,
    };
    const params = { chatConfigId };
    const { data } = await httpService.get<C3ChatMetadataPayload>(config, params);
    return data;
  };

  const queryResult: UseQueryResult<C3ChatMetadataPayload, Error> = useQuery(
    [SupportContextKey.C3ChatConfig, chatConfigId],
    fetchChatConfigPayload,
    { enabled: isQueryEnabled },
  );

  return {
    data: queryResult.data,
    isSuccess: queryResult.isSuccess,
    isError: queryResult.isError,
    // could be true even even the query is disabled because of initial state
    // of the useQuery hook so we check if the query is enabled
    // https://github.com/TanStack/query/issues/3584
    isLoading: queryResult.isLoading && isQueryEnabled,
  };
};

export default useGetC3ChatConfigPayload;
