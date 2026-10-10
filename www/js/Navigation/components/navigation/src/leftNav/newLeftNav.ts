import { useQuery } from "@tanstack/react-query";
import localStorage from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { isTestSite } from "@rbx/core-scripts/meta/environment";
import ixp from "@rbx/experimentation";
import { LEFT_NAV_LAYER_NAME } from "../util/leftNavIxpUtil";
import { getDeviceType, trackCounter, trackError, type Variant } from "./observability";

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

const toVariant = (isNew: boolean): Variant => (isNew ? "NEW" : "OLD");

export const useNewLeftNav = () => {
  const id = authenticatedUser()?.id?.toString();
  const userLookup = readLocalStorage() ?? {};
  const cached = id == null ? undefined : userLookup[id];
  const placeholder = cached ?? false;
  const { data, isPlaceholderData } = useQuery({
    queryKey: ["new-left-nav"],
    queryFn: async () => {
      const resolve = async () => {
        if (isTestSite()) {
          return true;
        }
        try {
          const ixpData = await ixp.getAllValuesForLayer(LEFT_NAV_LAYER_NAME);
          return ixpData.IsNewLeftNavEnabled === true;
        } catch (error) {
          trackError(
            "IxpFetchFailed",
            {
              cachedVariant: cached == null ? "none" : toVariant(cached),
              deviceType: getDeviceType(),
            },
            error,
          );
          throw error;
        }
      };
      const ixpNewLeftNav = await resolve();
      if (ixpNewLeftNav !== placeholder) {
        trackCounter("VariantSwapped", {
          from: toVariant(placeholder),
          to: toVariant(ixpNewLeftNav),
          cache: cached == null ? "miss" : "hit",
          deviceType: getDeviceType(),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userLookup[id!] = ixpNewLeftNav;
      localStorage.setLocalStorage(localStorageKey, { data: userLookup });
      return ixpNewLeftNav;
    },
    enabled: id != null,
    placeholderData: placeholder,
  });
  return { isNew: data === true, isSettled: !isPlaceholderData };
};
