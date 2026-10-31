import { useQuery } from "@tanstack/react-query";
import ixp from "@rbx/experimentation";
import { DOWNLOAD_FUNNEL_LAYER_NAME } from "./topNavDownloadExposureUtil";

const downloadModalEnabledKey = "IsDownloadModalEnabled";

type UseDownloadModalIxpResult = {
  isDownloadModalEnabled: boolean;
  isLoading: boolean;
};

export const useDownloadModalIxp = (): UseDownloadModalIxpResult => {
  const { data, isLoading } = useQuery({
    queryKey: [`ixp/${DOWNLOAD_FUNNEL_LAYER_NAME}`],
    queryFn: async () => {
      try {
        return await ixp.getAllValuesForLayer(DOWNLOAD_FUNNEL_LAYER_NAME);
      } catch {
        return {};
      }
    },
    staleTime: Infinity,
  });

  return {
    isDownloadModalEnabled: data?.[downloadModalEnabledKey] === true,
    isLoading,
  };
};

export const logDownloadModalExposure = (): void => {
  ixp.logLayerExposure(DOWNLOAD_FUNNEL_LAYER_NAME);
};
