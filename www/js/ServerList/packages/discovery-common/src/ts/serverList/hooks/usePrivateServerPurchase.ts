import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import serverListService from "../../../js/serverList/services/serverListService";
import { PrivateServerEventType } from "../../../js/serverList/analytics/privateServerLogging";
import type { GameInstanceQueryParams } from "../../../js/serverList/services/serverListService";

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
