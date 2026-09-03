import { useQuery } from '@tanstack/react-query';
import guacService, {
  ConfigureGroupUiResponse,
  GroupDetailsUiResponse
} from '../services/guacService';

// Define the mapping of keys to their corresponding response types
const guacServiceTypes = {
  'configure-group-ui': 'getConfigureGroupUiGuac',
  'abuse-reporting-revamp': 'getAbuseReportRevampPolicyNonThrowing',
  'group-details-ui': 'getGroupDetailsUiGuac'
} as const;

type GuacServiceKey = keyof typeof guacServiceTypes;

// Type mapping for response types
type GuacResponseMap = {
  'configure-group-ui': ConfigureGroupUiResponse;
  'group-details-ui': GroupDetailsUiResponse;
  'abuse-reporting-revamp': {
    EnableGroupComment: boolean;
    EnableGroupPost: boolean;
  };
};

/**
 * Custom hook for managing GUAC (Great Universal App Configurator) configuration.
 * Uses React Query for caching, background refetching, and error handling.
 *
 * @param key - The GUAC service key to determine which configuration to fetch
 * @returns Object containing:
 *  - data: The GUAC configuration response (typed based on the key)
 *  - isLoading: Boolean indicating if the request is in progress
 *  - error: Error object if the request failed, null otherwise
 *  - refetch: Function to manually refetch the data
 */

// Get the appropriate query key and query function based on the key
const getQueryConfig = <T extends GuacServiceKey>(key: T) => {
  switch (key) {
    case 'configure-group-ui':
      return {
        queryKey: key,
        queryFn: () => guacService.getConfigureGroupUiGuac() as Promise<GuacResponseMap[T]>
      };
    case 'abuse-reporting-revamp':
      return {
        queryKey: key,
        queryFn: () =>
          guacService.getAbuseReportRevampPolicyNonThrowing() as Promise<GuacResponseMap[T]>
      };
    case 'group-details-ui':
      return {
        queryKey: key,
        queryFn: () => guacService.getGroupDetailsUiGuac() as Promise<GuacResponseMap[T]>
      };
    default:
      throw new Error(`Unknown GUAC service key: ${key}`);
  }
};

const useGuacConfig = <T extends GuacServiceKey>(
  key: T
): {
  data: GuacResponseMap[T];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const { queryKey, queryFn } = getQueryConfig(key);
  const { data = {} as GuacResponseMap[T], isLoading, error, refetch } = useQuery({
    queryKey: ['GUAC', queryKey],
    queryFn,
    refetchOnWindowFocus: false,
    retry: 2
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch();
    }
  };
};

export default useGuacConfig;
