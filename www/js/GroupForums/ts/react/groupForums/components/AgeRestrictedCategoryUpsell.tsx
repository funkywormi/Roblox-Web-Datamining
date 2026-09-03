import React, { FC, useCallback, useMemo } from 'react';
import { Button, Icon } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading, useSystemFeedback } from 'react-style-guide';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { groupsConfig } from '../translation.config';
import useForumStore from '../hooks/useForumStore';
import {
  EventContext,
  EventLocationTab,
  EventTriggerReason,
  EventUpsellComponent
} from '../../shared/constants/eventConstants';
import {
  AgeCheckClickEvent,
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';
import MetricsElement from '../../shared/components/MetricsElement';
import { updateGuacNonce } from '../../shared/utils/requestCacheBust';
import useGuacConfig from '../../shared/hooks/useGuacConfig';

export type AgeRestrictedCategoryUpsellProps = {} & WithTranslationsProps;

const AgeRestrictedCategoryUpsell: FC<AgeRestrictedCategoryUpsellProps> = ({ translate }) => {
  const { isLoading, data: groupDetailsUi, refetch } = useGuacConfig('group-details-ui');
  const { systemFeedbackService } = useSystemFeedback();

  const groupId = useForumStore.use.groupId();
  const eligibility = groupDetailsUi?.eligibleForRestrictedCommunications ?? 'Ineligible';

  const componentMetric = useMemo(
    () => ({
      groupId,
      triggerReason: EventTriggerReason.AccessRestrictedCategory,
      context: EventContext.GroupForums,
      locationTab: EventLocationTab.ForumsTab,
      upsellComponent: EventUpsellComponent.CategoryUpsell,
      bannerType: 'ageRestrictedCategoryUpsell',
      upsellImpressionId: getImpressionId()
    }),
    [groupId]
  );

  const continueClickMetric = useMemo(
    () =>
      CommunityMetric.AgeCheckClick({
        ...componentMetric,
        clickTargetType: 'ageRestrictedCategoryUpsellFaeModal'
      } as AgeCheckClickEvent),
    [componentMetric]
  );

  const handleContinueClick = useCallback(() => {
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
  }, [refetch, systemFeedbackService, translate]);

  if (isLoading) return <Loading />;

  return (
    <div
      className='age-restricted-category-upsell'
      data-testid={`age-restricted-category-upsell-${eligibility}`}>
      <MetricsElement
        isOneTimeEvent
        metric={CommunityMetric.AgeCheckBannerShown(componentMetric)}
      />
      <div className='age-restricted-category-upsell-icon-frame' aria-hidden>
        <Icon
          name='icon-regular-lock-closed'
          size='XLarge'
          className='age-restricted-category-upsell-lock-icon'
        />
      </div>
      <h2 className='age-restricted-category-upsell-heading'>
        {translate('Heading.AgeRestrictedCategory')}
      </h2>
      <span className='age-restricted-category-upsell-description'>
        {translate(
          eligibility === 'AgeVerificationRequired'
            ? 'Description.AgeRestrictedCategoryEligible'
            : 'Description.AgeRestrictedCategoryIneligible'
        )}
      </span>
      {eligibility === 'AgeVerificationRequired' && (
        <MetricsElement metric={continueClickMetric}>
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            className='age-restricted-category-upsell-continue-button'
            variant='Emphasis'
            size='Medium'
            onClick={handleContinueClick}>
            {translate('Action.Continue')}
          </Button>
        </MetricsElement>
      )}
    </div>
  );
};

export default withTranslations(AgeRestrictedCategoryUpsell, groupsConfig);
