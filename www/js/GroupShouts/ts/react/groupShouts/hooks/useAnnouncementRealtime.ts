import { useMemo } from 'react';
import { useRealtimeSubscription } from '../../shared/contexts/RealtimeContext';
import { ChannelHelper } from '../../shared/services/realtimeService';
import { CommunitySignalType } from '../../shared/utils/realtimeProxy';
import type { BasePayload } from '../../shared/utils/realtimeProxy';

type UseAnnouncementRealtimeParams = {
  groupId: number;
  realtimeEnabled: boolean;
  refetchAnnouncement: () => void;
};

export default function useAnnouncementRealtime({
  groupId,
  realtimeEnabled,
  refetchAnnouncement
}: UseAnnouncementRealtimeParams): void {
  const communityChannel = useMemo(
    () => (realtimeEnabled ? ChannelHelper.community(groupId) : null),
    [realtimeEnabled, groupId]
  );

  useRealtimeSubscription(communityChannel, (messages: BasePayload[]) => {
    if (!messages.some(m => m.signalType === CommunitySignalType.AnnouncementReactionChanged)) {
      return;
    }
    // eslint-disable-next-line no-void
    void refetchAnnouncement();
  });
}
