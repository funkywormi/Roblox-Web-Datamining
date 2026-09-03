import React, { useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Button } from '@rbx/foundation-ui';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import communityFeatureFreezesService from '../../shared/services/communityFeatureFreezesService';
import ActionableBanner from '../../shared/components/ActionableBanner';
import { groupsConfig } from '../../shared/translation.config';
import useForumStore from '../hooks/useForumStore';

const ForumsDisabledOwnerBanner = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { forumsRead, forumsWrite, refetch } = useCommunityFeatureFreezes();
  const { systemFeedbackService } = useSystemFeedback();
  const groupId = useForumStore.use.groupId();
  const [isReenabling, setIsReenabling] = useState(false);

  const handleReenable = async (): Promise<void> => {
    setIsReenabling(true);
    try {
      await communityFeatureFreezesService.reenableForums(groupId);
      systemFeedbackService.success(translate('Message.ReenableForumsSuccess'));
      await refetch();
      // need to trigger a full reload, because group profile page may also change
      window.location.reload();
    } catch (error) {
      systemFeedbackService.warning(translate('Message.ReenableForumsFail'));
    } finally {
      setIsReenabling(false);
    }
  };

  let title = '';
  let content = '';
  let canReenable = false;

  if (!forumsRead.isDisabled && !forumsWrite.isDisabled) {
    return null;
  }

  if (forumsRead.isDisabled) {
    title = translate('Message.ForumsUnavailableTitle');
    content = translate('Message.ForumsUnavailableContent');
    canReenable = forumsRead.canReenable;
  } else if (forumsWrite.isDisabled) {
    title = translate('Message.ForumsLimitedTitle');
    content = translate('Message.ForumsLimitedContent');
    canReenable = forumsWrite.canReenable;
  }

  return (
    <ActionableBanner title={title} content={content} testId='forums-disabled-owner-banner'>
      {canReenable && (
        <Button size='Small' variant='Emphasis' isLoading={isReenabling} onClick={handleReenable}>
          {translate('Action.ReenableForums')}
        </Button>
      )}
    </ActionableBanner>
  );
};

export default withTranslations(ForumsDisabledOwnerBanner, groupsConfig);
