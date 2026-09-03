import { useQuery } from '@tanstack/react-query';
import { UserData } from '../../shared/types';
import usersService from '../../shared/services/usersService';

interface UseUsernameLookupResult {
  user: UserData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
}

const useUsernameLookup = (username: string): UseUsernameLookupResult => {
  const queryKey = ['user-from-username', username];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!username || username.length === 0) return null;

      const response = await usersService.getUsersFromUsernames({
        usernames: [username]
      });

      if (response.length > 0) {
        return response[0];
      }

      return null;
    }
  });

  return {
    user: data,
    isLoading,
    isError,
    isNotFound: username.length > 0 && data === null && !isLoading
  };
};

export default useUsernameLookup;
