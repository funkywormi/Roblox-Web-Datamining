import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '../../shared/contexts/RealtimeContext';
import { ChannelHelper } from '../../shared/services/realtimeService';
import { CommunitySignalType } from '../../shared/utils/realtimeProxy';
import type { BasePayload } from '../../shared/utils/realtimeProxy';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import queryKeys from '../utils/queryKeys';

const DELAYED_RESULTS_INVALIDATION_MS = 3000;

type UsePollRealtimeParams = {
  groupId: number;
  formId: number;
};

type UsePollRealtimeResult = {
  realtimeEnabled: boolean;
};

export default function usePollRealtime({
  groupId,
  formId
}: UsePollRealtimeParams): UsePollRealtimeResult {
  const queryClient = useQueryClient();
  const { features } = useCommunityProductFeatures();
  const realtimeEnabled = !!features.RealtimeMessaging;
  const delayedInvalidationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const communityChannel = useMemo(
    () => (realtimeEnabled && !!groupId && !!formId ? ChannelHelper.community(groupId) : null),
    [realtimeEnabled, groupId, formId]
  );

  const invalidatePollResults = useCallback(() => {
    const queryKey = queryKeys.getFormResultsKey(groupId, formId);

    queryClient.invalidateQueries({ queryKey }).catch(() => undefined);

    if (delayedInvalidationTimeoutRef.current) {
      clearTimeout(delayedInvalidationTimeoutRef.current);
    }

    delayedInvalidationTimeoutRef.current = setTimeout(() => {
      delayedInvalidationTimeoutRef.current = null;
      queryClient.invalidateQueries({ queryKey }).catch(() => undefined);
    }, DELAYED_RESULTS_INVALIDATION_MS);
  }, [formId, groupId, queryClient]);

  useEffect(() => {
    return () => {
      if (delayedInvalidationTimeoutRef.current) {
        clearTimeout(delayedInvalidationTimeoutRef.current);
        delayedInvalidationTimeoutRef.current = null;
      }
    };
  }, [formId, groupId, realtimeEnabled]);

  useRealtimeSubscription(communityChannel, (messages: BasePayload[]) => {
    if (!messages.some(m => m.signalType === CommunitySignalType.AnnouncementPollResponded)) {
      return;
    }
    invalidatePollResults();
  });

  return { realtimeEnabled };
}
