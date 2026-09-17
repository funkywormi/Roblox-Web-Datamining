import { useEffect } from 'react';
import useViewportSize from '../../shared/hooks/useViewportSize';
import useForumStore from './useForumStore';

const useHydrateForumStore = (groupId: number, userId: number, enabled: boolean): void => {
  const { isSmallViewport } = useViewportSize();
  const hydrate = useForumStore.use.hydrate();

  useEffect(() => {
    if (enabled) {
      hydrate({ groupId, userId, useInlineReply: !isSmallViewport });
    }
  }, [enabled, groupId, hydrate, isSmallViewport, userId]);
};

export default useHydrateForumStore;
