import { dataStores } from 'core-roblox-utilities';
import { useEffect, useState } from 'react';

const { localeDataStore } = dataStores;
export const DEFAULT_LOCALE = 'en-us';

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
    if (!result || !result.data || result.status !== 200) {
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
export default function useGetUserLocale(): {
  data?: string;
  isLoading: boolean;
  isError: boolean;
} {
  const [data, setData] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    fetchUserLocale().then(
      localeData => {
        setData(localeData);
        setIsLoading(false);
      },
      () => {
        setIsError(true);
        setIsLoading(false);
      }
    );
  }, []);

  return {
    data,
    isLoading,
    isError
  };
}
