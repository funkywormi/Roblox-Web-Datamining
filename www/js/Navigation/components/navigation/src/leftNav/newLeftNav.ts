import { useQuery } from "@tanstack/react-query";
import localStorage from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { isTestSite } from "@rbx/core-scripts/meta/environment";
import ixp from "@rbx/experimentation";

type LocalStorageData = Record<string, boolean>;
const localStorageKey = "new-left-nav";

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

export const useNewLeftNav = () => {
  const id = authenticatedUser()?.id?.toString();
  const userLookup = readLocalStorage() ?? {};
  return useQuery({
    queryKey: ["new-left-nav"],
    queryFn: async () => {
      if (isTestSite()) {
        return true;
      }
      const ixpData = await ixp.getAllValuesForLayer("Website.Navigation");
      const ixpNewLeftNav = ixpData.IsNewLeftNavEnabled === true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userLookup[id!] = ixpNewLeftNav;
      localStorage.setLocalStorage(localStorageKey, { data: userLookup });
      return ixpNewLeftNav;
    },
    enabled: id != null,
    placeholderData: id == null ? false : (userLookup[id] ?? false),
  }).data;
};
