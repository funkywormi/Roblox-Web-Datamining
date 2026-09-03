import React, { FC, useCallback, useMemo } from 'react';
import { Button } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { groupsConfig } from '../translation.config';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import ActionableBanner from '../../shared/components/ActionableBanner';
import CountdownAlert from '../../shared/components/CountdownAlert';
import { updateGuacNonce } from '../../shared/utils/requestCacheBust';
import groupConstants from '../../shared/constants/groupConstants';
import useForumStore from '../hooks/useForumStore';
import {
  EventContext,
  EventLocationTab,
  EventUpsellComponent
} from '../../shared/constants/eventConstants';
import MetricsElement from '../../shared/components/MetricsElement';
import CommunityEventStream, {
  getImpressionId,
  CommunityMetric
} from '../../shared/utils/eventStream';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { TwoWayCommunicationsUpsellStatus } from '../../shared/services/guacService';

const HELP_ARTICLE = 'https://help.roblox.com/hc/articles/39143693116052';

const launchDate = new Date('2026-03-18T23:45:00.000Z');

type AgeAssuranceUpsellKind = 'default' | 'configureForumCategories';

type Props = { kind: AgeAssuranceUpsellKind | undefined } & WithTranslationsProps;

const AgeAssuranceUpsell: FC<Props> = ({ kind = 'default', translate }) => {
  const { isLoading, data: groupDetailsUi, refetch } = useGuacConfig('group-details-ui');
  const { systemFeedbackService } = useSystemFeedback();
  const groupId = useForumStore.use.groupId();
  const { features } = useCommunityProductFeatures();
  const { forumsRead, forumsWrite } = useCommunityFeatureFreezes();

  const ComponentMetric = useMemo(
    () => ({
      groupId,
      context: EventContext.GroupForums,
      locationTab: EventLocationTab.ForumsTab,
      upsellComponent: EventUpsellComponent.BannerComponent,
      bannerType: 'fullWidthUpsellCountDown',
      upsellImpressionId: getImpressionId()
    }),
    [groupId]
  );

  const isForumsLimited = forumsRead.isDisabled || forumsWrite.isDisabled;
  let upsellEligibility: TwoWayCommunicationsUpsellStatus = 'Ineligible';
  if (kind === 'configureForumCategories') {
    const restrictedCategoriesEligibility =
      groupDetailsUi?.eligibleForRestrictedCommunications ?? 'Ineligible';
    if (restrictedCategoriesEligibility === 'Ineligible') {
      upsellEligibility = groupDetailsUi?.checkTwoWayCommunicationsUpsell ?? 'Ineligible';
    } else if (restrictedCategoriesEligibility === 'Eligible') {
      // if user is eligible for restricted categories then they should not see an upsell
      upsellEligibility = 'Completed';
    } else if (restrictedCategoriesEligibility === 'AgeVerificationRequired') {
      // if user requires age verification for restricted categories then they are eligible for the upsell
      upsellEligibility = 'Eligible';
    }
  } else {
    upsellEligibility = groupDetailsUi?.checkTwoWayCommunicationsUpsell ?? 'Ineligible';
  }
  const shouldShowBanner = !isLoading && upsellEligibility !== 'Completed' && !isForumsLimited;

  const handleCtaClick = useCallback(() => {
    const shouldTriggerFaeModal = upsellEligibility === 'Eligible';
    if (!shouldTriggerFaeModal) {
      CommunityEventStream.sendEvent(
        CommunityMetric.AgeCheckClick({
          ...ComponentMetric,
          clickTargetType: 'ageAssuranceUpsellAccountSettings'
        })
      );

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

    CommunityEventStream.sendEvent(
      CommunityMetric.AgeCheckClick({
        ...ComponentMetric,
        clickTargetType: 'ageAssuranceUpsellFaeModal'
      })
    );

    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageEstimationFeatureParams)
      .catch(() => systemFeedbackService.warning(translate('NetworkError')))
      .finally(() => {
        updateGuacNonce();
        refetch();
      });
  }, [refetch, systemFeedbackService, translate, upsellEligibility, ComponentMetric]);

  const handleDismiss = useCallback(() => {
    CommunityEventStream.sendEvent(
      CommunityMetric.AgeCheckClick({
        ...ComponentMetric,
        clickTargetType: 'ageAssuranceUpsellDismiss'
      })
    );
  }, [ComponentMetric]);

  if (!shouldShowBanner) {
    return null;
  }

  const data: { title: string; content: string; storageKey: string } = {
    title: '',
    content: '',
    storageKey: ''
  };
  if (features.ForumsAgeCheck) {
    if (kind === 'configureForumCategories') {
      data.title = translate('Heading.RestrictedCategoriesAgeCheck');
      data.content = translate('Description.RestrictedCategoriesAgeCheck');
      data.storageKey = 'Roblox.GroupAnnouncements.RestrictedCategoriesDismissibleAgeCheck';
    } else {
      data.title = translate('Heading.AgeCheck');
      data.content = translate('Description.AgeCheck');
      data.storageKey = 'Roblox.GroupAnnouncements.DismissibleAgeCheck';
    }
  } else {
    data.title = translate('Heading.AgeAssuranceUpsell');
    data.content = translate('Description.AgeAssuranceUpsell');
    data.storageKey = 'Roblox.GroupAnnouncements.DismissibleAgeAssuranceUpsell';
  }

  return (
    <ActionableBanner
      testId={`age-assurance-upsell-${upsellEligibility}`}
      title={data.title}
      content={data.content}
      alert={!features.ForumsAgeCheck && <CountdownAlert endingDate={launchDate} />}
      isDismissedLocalStorageKey={data.storageKey}
      onDismiss={handleDismiss}>
      <MetricsElement
        isOneTimeEvent
        metric={CommunityMetric.AgeCheckBannerShown(ComponentMetric)}
      />
      <Button
        isLoading={isLoading}
        isDisabled={isLoading}
        className='shrink-0'
        variant='Emphasis'
        size='Small'
        onClick={handleCtaClick}>
        {translate('Action.Continue')}
      </Button>
      <MetricsElement
        metric={CommunityMetric.AgeCheckClick({
          ...ComponentMetric,
          clickTargetType: 'ageAssuranceUpsellViewDetails'
        })}>
        <Button
          as='a'
          variant='Utility'
          size='Small'
          target='_blank'
          rel='noreferrer'
          className='shrink-0'
          href={HELP_ARTICLE}>
          {translate('Action.ViewDetails')}
        </Button>
      </MetricsElement>
    </ActionableBanner>
  );
};

export default withTranslations(AgeAssuranceUpsell, groupsConfig);
