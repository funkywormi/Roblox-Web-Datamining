import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { apiSet } from "../core/constants/services";
import {
  SierraChatConfigPayloadResponse,
  SierraChatConfigService,
} from "../core/types/serviceResponse";
import { SupportContextKey } from "../core/types/common";

const useGetSierraChatConfigPayload = (guardianApprovalId?: string): SierraChatConfigService => {
  const isQueryEnabled = Boolean(guardianApprovalId);
  const fetchChatConfigPayload = async (): Promise<SierraChatConfigPayloadResponse> => {
    const config: { url: string } = { url: apiSet.fetchChatConfigPayload.url };
    const params = { payloadId: guardianApprovalId };

    const { data } = await httpService.get<SierraChatConfigPayloadResponse>(config, params);
    return data;
  };

  const queryResult: UseQueryResult<SierraChatConfigPayloadResponse, Error> = useQuery(
    [SupportContextKey.ChatConfigPayload, guardianApprovalId],
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

export default useGetSierraChatConfigPayload;
