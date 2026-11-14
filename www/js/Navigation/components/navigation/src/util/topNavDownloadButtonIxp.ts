import { useQuery } from "@tanstack/react-query";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";
import { isTestSite } from "@rbx/core-scripts/meta/environment";
import useMountedValue from "../hooks/useMountedValue";
import { getNavCapability } from "./navCapabilities";
import { useNavUser } from "./navUser";

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

export const useTopNavDownloadButton = (isEnabledOnServer = false) => {
  const id = useNavUser()?.id?.toString();
  // The cached answer is in local storage, so it can only be used once mounted.
  const cachedValue = useMountedValue(
    () => (id == null ? false : (readLocalStorage()?.[id] ?? false)),
    false,
  );
  return useQuery({
    queryKey: ["top-nav-download-button"],
    queryFn: async () => {
      if (isTestSite()) {
        return true;
      }
      const isTopNavDownloadEnabled = getNavCapability("isTopNavDownloadEnabled");
      const ixpValue = isTopNavDownloadEnabled == null ? false : await isTopNavDownloadEnabled();
      const userLookup = readLocalStorage() ?? {};
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userLookup[id!] = ixpValue;
      setItem(localStorageKey, { data: userLookup });
      return ixpValue;
    },
    enabled: id != null,
    placeholderData: isEnabledOnServer || cachedValue,
  }).data;
};
