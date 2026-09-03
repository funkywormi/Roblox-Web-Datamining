import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  GROUP_MEMBERSHIP_CHANGED_EVENT,
  GroupMembershipChangedEventDetail
} from '../constants/groupMembershipConstants';
import queryKeys from '../../groupShouts/utils/queryKeys';

/**
 * Listens for the `GROUP_MEMBERSHIP_CHANGED_EVENT` window event dispatched by the Angular
 * group controller and invalidates the React-side membership query when the event targets
 * the supplied group. Lives in its own hook so the React/Angular bridge has one named
 * surface — easier to find, replace, or rip out when the page migrates fully to React.
 */
export const useGroupMembershipChangedListener = (groupId: number): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<GroupMembershipChangedEventDetail>;
      if (detail?.groupId === groupId) {
        queryClient
          .invalidateQueries({ queryKey: queryKeys.getGroupMembershipKey(groupId) })
          .catch(() => {
            /* best-effort refresh; failure falls back to next natural refetch */
          });
      }
    };
    window.addEventListener(GROUP_MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(GROUP_MEMBERSHIP_CHANGED_EVENT, handler);
  }, [groupId, queryClient]);
};

export default useGroupMembershipChangedListener;
