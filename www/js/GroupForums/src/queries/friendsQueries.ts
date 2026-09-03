import { useQuery } from '@tanstack/react-query';
import friendsApiClient from '../clients/friends';

export const useGetUsersFriends = (userId?: number) => {
  return useQuery({
    enabled: userId !== undefined,
    queryKey: ['friends', userId],
    queryFn: () => {
      if (userId === undefined) {
        return undefined;
      }
      return friendsApiClient.getUsersFriends(userId);
    },
  });
};
