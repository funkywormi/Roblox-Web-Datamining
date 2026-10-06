import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import AgeCheckDialog from '../../shared/components/dialogs/AgeCheckDialog';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import {
  EventContext,
  EventLocationTab,
  EventTriggerReason
} from '../../shared/constants/eventConstants';
import useForumStore from '../hooks/useForumStore';
import { AgeCheckClickEvent, CommunityMetric } from '../../shared/utils/eventStream';

interface AgeCheckWrapperProps {
  trigger: EventTriggerReason;
  messageId?: string;
  // A post card carries its own post, and the surfaces that show cards leave the store empty.
  groupId?: number;
  postId?: string;
  children?: ReactNode;
}

const AgeCheckWrapper = ({
  children,
  trigger,
  messageId,
  groupId: groupIdOverride,
  postId: postIdOverride
}: AgeCheckWrapperProps): JSX.Element | null => {
  const { isLoading, data: groupDetailsUi, refetch } = useGuacConfig('group-details-ui');
  const storeGroupId = useForumStore.use.groupId();
  const storePostId = useForumStore.use.postId();
  const groupId = groupIdOverride ?? storeGroupId;
  const postId = postIdOverride ?? storePostId;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { features } = useCommunityProductFeatures();

  const upsellEligibility = groupDetailsUi?.checkTwoWayCommunicationsUpsell ?? 'Ineligible';
  const handleClick = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement>) => {
      if (!features.ForumsAgeCheck) {
        return;
      }

      const shouldShowBanner = !isLoading && upsellEligibility !== 'Completed';
      if (!shouldShowBanner) {
        return;
      }

      // Capture both mouse and keyboard activation before a child can perform its action.
      e.preventDefault();
      e.stopPropagation();
      setIsDialogOpen(true);
    },
    [features.ForumsAgeCheck, isLoading, upsellEligibility]
  );

  const onClose = useCallback(() => {
    refetch();
    setIsDialogOpen(false);
  }, [setIsDialogOpen, refetch]);

  const PartialComponentMetric: Partial<AgeCheckClickEvent> = useMemo(
    () =>
      CommunityMetric.AgeCheckClick({
        groupId,
        forumPostId: postId,
        forumMessageId: messageId,
        triggerReason: trigger,
        context: EventContext.GroupForums,
        locationTab: EventLocationTab.ForumsTab
      } as AgeCheckClickEvent).message,
    [groupId, postId, messageId, trigger]
  );

  if (!children) {
    return null;
  }

  return (
    <React.Fragment>
      <div
        role='button'
        tabIndex={0}
        onClickCapture={handleClick}
        onKeyDownCapture={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}>
        {children}
      </div>
      <AgeCheckDialog
        open={isDialogOpen}
        shouldTriggerFae={upsellEligibility === 'Eligible'}
        metricContext={PartialComponentMetric}
        onClose={onClose}
      />
    </React.Fragment>
  );
};

export default AgeCheckWrapper;
