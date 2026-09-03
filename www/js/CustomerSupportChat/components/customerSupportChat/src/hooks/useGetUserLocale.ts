import { useQuery } from "@tanstack/react-query";
import { dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";

const { localeDataStore } = dataStores;
export const DEFAULT_LOCALE = "en-us";

// Fetches the user's locale from the data store.
type UserLocaleResult = {
  status: number;
  data?: {
    signupAndLogin?: {
      locale?: string;
    };
  };
};

const fetchUserLocale = async (): Promise<string | undefined> => {
  try {
    const result = (await localeDataStore.getUserLocale()) as UserLocaleResult;
    if (!result?.data || result.status !== 200) {
      return undefined;
    }
    return result.data.signupAndLogin?.locale;
  } catch {
    return undefined;
  }
};

/**
 * React Query hook to get the user's locale
 */
export default function useGetUserLocale(enabled: boolean): {
  data?: string;
  isLoading: boolean;
  isError: boolean;
} {
  const queryResult = useQuery({
    queryKey: ["rbxUserLocale"],
    queryFn: fetchUserLocale,
    enabled,
  });
  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
  };
}
