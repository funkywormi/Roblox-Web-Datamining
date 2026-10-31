import { useQuery } from "@tanstack/react-query";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { isTestSite } from "@rbx/core-scripts/meta/environment";
import { getNavCapability } from "./navCapabilities";

type LocalStorageData = Record<string, boolean>;
const localStorageKey = "top-nav-download-button-v2";

const readLocalStorage = (): LocalStorageData | null => {
  const localData = getItem(localStorageKey);
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
      const isTopNavDownloadEnabled = getNavCapability("isTopNavDownloadEnabled");
      const ixpValue = isTopNavDownloadEnabled == null ? false : await isTopNavDownloadEnabled();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userLookup[id!] = ixpValue;
      setItem(localStorageKey, { data: userLookup });
      return ixpValue;
    },
    enabled: id != null,
    placeholderData: id == null ? false : (userLookup[id] ?? false),
  }).data;
};
