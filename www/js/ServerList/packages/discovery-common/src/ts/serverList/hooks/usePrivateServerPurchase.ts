import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import serverListService from "../../../js/serverList/services/serverListService";
import { PrivateServerEventType } from "../../../js/serverList/analytics/privateServerLogging";
import type { GameInstanceQueryParams } from "../../../js/serverList/services/serverListService";
import { privateServerListKeys } from "../constants/queryKeys";

type CreateServerSuccessData = {
  vipServerId: number;
  FailureReason?: string;
  ExpirationTimeInMinutes?: number;
};

type CreateServerVariables = {
  serverName: string;
};

type UsePrivateServerPurchaseParams = {
  universeId: number;
  price: number;
  refreshServers: (params?: GameInstanceQueryParams) => void;
  onSuccess?: (data: CreateServerSuccessData) => void;
  onError?: (errorMsg: string, data?: CreateServerSuccessData) => void;
};

const usePrivateServerPurchase = ({
  universeId,
  price,
  refreshServers,
  onSuccess,
  onError,
}: UsePrivateServerPurchaseParams) => {
  const [idempotencyKey] = useState(() => uuidService.generateRandomUuid());
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ serverName }: CreateServerVariables) => {
      const response = await serverListService.createPrivateServer(
        universeId,
        serverName,
        price,
        idempotencyKey,
      );
      return response.data as CreateServerSuccessData;
    },
    onSuccess: data => {
      window.EventTracker?.start(PrivateServerEventType.PRIVATE_SERVER_LOAD);
      refreshServers({ startTime: performance.now() });
      // Price/discount can change after a purchase, so refetch the server list metadata.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      queryClient.invalidateQueries({
        queryKey: privateServerListKeys.universePrivateServerMetadata(universeId),
      });
      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const errorData =
        error != null && typeof error === "object" && "data" in error
          ? (error as { data?: { errors?: { userFacingMessage?: string }[] } }).data
          : undefined;

      const errorMsg = errorData?.errors?.[0]?.userFacingMessage;
      onError?.(errorMsg ?? "");
    },
  });

  return {
    createServer: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

export type { CreateServerSuccessData, UsePrivateServerPurchaseParams };
export default usePrivateServerPurchase;
