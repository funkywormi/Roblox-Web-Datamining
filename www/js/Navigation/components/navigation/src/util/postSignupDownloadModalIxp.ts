import { useQuery } from "@tanstack/react-query";
import ixp from "@rbx/experimentation";

const downloadFunnelLayerName = "Website.DownloadFunnel";
const downloadModalEnabledKey = "IsDownloadModalEnabled";

type UseDownloadModalIxpResult = {
  isDownloadModalEnabled: boolean;
  isLoading: boolean;
};

export const useDownloadModalIxp = (): UseDownloadModalIxpResult => {
  const { data, isLoading } = useQuery({
    queryKey: [`ixp/${downloadFunnelLayerName}`],
    queryFn: async () => {
      try {
        return await ixp.getAllValuesForLayer(downloadFunnelLayerName);
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
