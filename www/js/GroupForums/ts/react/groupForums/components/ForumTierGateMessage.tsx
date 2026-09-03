import React, { useCallback } from 'react';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { Button } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { groupsConfig } from '../translation.config';
import groupConstants from '../../shared/constants/groupConstants';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import { updateGuacNonce } from '../../shared/utils/requestCacheBust';
import { EventContext } from '../../shared/constants/eventConstants';

export type ForumTierGateMessageProps = {
  testId?: string;
} & WithTranslationsProps;

/**
 * Shown in place of a write affordance when `useForumTierGate` blocks the
 * viewer, with a CTA to the account settings page where they can verify age.
 */
const ForumTierGateMessage = ({
  testId = 'forum-tier-gate',
  translate
}: ForumTierGateMessageProps): JSX.Element => {
  const { data: groupDetailsUi, refetch } = useGuacConfig('group-details-ui');
  const { systemFeedbackService } = useSystemFeedback();
  const eligibility = groupDetailsUi?.eligibleForRestrictedCommunications ?? 'Ineligible';

  const handleContinue = useCallback(() => {
    if (eligibility !== 'AgeVerificationRequired') {
      window.open(groupConstants.urls.accountSettings, '_blank');
      return;
    }

    const ageEstimationFeatureParams = {
      featureName: 'TriggerFacialAgeEstimationRecourse',
      namespace: 'account_identity/AgeCheck',
      isAsyncCall: false,
      featureSpecificData: {
        context: EventContext.GroupForums
      }
    };

    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageEstimationFeatureParams)
      .catch(() => systemFeedbackService.warning(translate('NetworkError')))
      .finally(() => {
        updateGuacNonce();
        refetch();
      });
  }, [eligibility, refetch, systemFeedbackService, translate]);

  return (
    <div className='desktop-persistent-composer-tier-gate' data-testid={testId}>
      <span className='text-body-medium content-emphasis'>
        {translate('Description.TierGatedForumWrite')}
      </span>
      <Button
        className='shrink-0'
        variant='Emphasis'
        size='Small'
        data-testid={`${testId}-action`}
        onClick={handleContinue}>
        {translate('Action.Continue')}
      </Button>
    </div>
  );
};

ForumTierGateMessage.displayName = 'ForumTierGateMessage';

export default withTranslations(ForumTierGateMessage, groupsConfig);
