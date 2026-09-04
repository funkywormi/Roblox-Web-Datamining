import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ExperimentationService from "@rbx/experimentation";
import { AnyUrl } from "@rbx/core-lib/url/any";
import createDeeplinkToken from "./deferredDeeplinkTokenService";
import {
  resolveDeeplinkTokenParams,
  deeplinkFunnelIxpLayerName,
} from "./resolveDeeplinkTokenParams";

type UseAppDownloadParams = {
  linkId?: string;
  downloadSource?: string;
};

type UseAppDownloadResult = {
  resolveTokenizedHref: (baseUrl: AnyUrl) => Promise<AnyUrl>;
  isLoading: boolean;
  logExposure: () => void;
};

export const useAppDownload = ({
  linkId,
  downloadSource,
}: UseAppDownloadParams): UseAppDownloadResult => {
  const ixpQuery = useQuery({
    queryKey: [`ixp/${deeplinkFunnelIxpLayerName}`],
    queryFn: async () => {
      try {
        return await ExperimentationService.getAllValuesForLayer(deeplinkFunnelIxpLayerName);
      } catch {
        return {};
      }
    },
    staleTime: Infinity,
  });

  const resolveTokenizedHref = useCallback(
    async (baseUrl: AnyUrl): Promise<AnyUrl> => {
      if (linkId == null) {
        return baseUrl;
      }
      const { authTicket, btId } = await resolveDeeplinkTokenParams({
        ixpValues: ixpQuery.data ?? {},
      });
      const token = await createDeeplinkToken(linkId, { authTicket, btId, downloadSource });
      if (!token) {
        return baseUrl;
      }
      return baseUrl.withSearchParamsAppended({ token });
    },
    [linkId, downloadSource, ixpQuery.data],
  );

  const logExposure = useCallback(() => {
    ExperimentationService.logLayerExposure(deeplinkFunnelIxpLayerName);
  }, []);

  return {
    resolveTokenizedHref,
    isLoading: ixpQuery.isLoading,
    logExposure,
  };
};

export default useAppDownload;
