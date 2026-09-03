import { useQuery } from "@tanstack/react-query";
import localStorage from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { isTestSite } from "@rbx/core-scripts/meta/environment";
import ixp from "@rbx/experimentation";

type LocalStorageData = Record<string, boolean>;
const localStorageKey = "top-nav-download-button";

const readLocalStorage = (): LocalStorageData | null => {
  const localData = localStorage.getLocalStorage(localStorageKey);
  if (localData == null || typeof localData !== "object") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const userLookup = (localData as Record<string, unknown>).data;
  if (userLookup == null || typeof userLookup !== "object") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return userLookup as LocalStorageData;
};

export const useTopNavDownloadButton = () => {
  const id = authenticatedUser()?.id?.toString();
  const userLookup = readLocalStorage() ?? {};
  return useQuery({
    queryKey: ["top-nav-download-button"],
    queryFn: async () => {
      if (isTestSite()) {
        return true;
      }
      const ixpData = await ixp.getAllValuesForLayer("Website.Navigation");
      const ixpValue = ixpData.IsTopNavDownloadEnabled === true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userLookup[id!] = ixpValue;
      localStorage.setLocalStorage(localStorageKey, { data: userLookup });
      return ixpValue;
    },
    enabled: id != null,
    placeholderData: id == null ? false : (userLookup[id] ?? false),
  }).data;
};
