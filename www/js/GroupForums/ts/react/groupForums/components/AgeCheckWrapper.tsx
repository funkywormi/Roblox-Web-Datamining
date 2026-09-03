import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
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
  children?: ReactElement;
}

const AgeCheckWrapper: FC<AgeCheckWrapperProps> = ({ children, trigger, messageId }) => {
  const { isLoading, data: groupDetailsUi, refetch } = useGuacConfig('group-details-ui');
  const groupId = useForumStore.use.groupId();
  const postId = useForumStore.use.postId();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { features } = useCommunityProductFeatures();

  const upsellEligibility = groupDetailsUi?.checkTwoWayCommunicationsUpsell ?? 'Ineligible';
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!features.ForumsAgeCheck) {
        return;
      }

      const shouldShowBanner = !isLoading && upsellEligibility !== 'Completed';
      if (!shouldShowBanner) {
        return;
      }

      // prevent any children clicks, only works this inverted way due to onClickCapture
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
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick((e as unknown) as React.MouseEvent<HTMLDivElement>);
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
