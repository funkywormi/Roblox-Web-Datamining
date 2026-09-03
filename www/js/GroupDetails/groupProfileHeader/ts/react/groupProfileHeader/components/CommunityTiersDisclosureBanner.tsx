import React, { FC, useCallback, useMemo } from 'react';
import { Button } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import ActionableBanner from '../../shared/components/ActionableBanner';
import MetricsElement from '../../shared/components/MetricsElement';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../../shared/contexts/CommunityProductFeaturesContext';
import { EventContext } from '../../shared/constants/eventConstants';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';
import { getCommonParams } from '../../shared/utils/pageInfo';

const COMMUNITY_TIERS_HELP_ARTICLE_URL =
  'https://en.help.roblox.com/hc/en-us/articles/51390258707988';
const DISMISSED_STORAGE_KEY = 'Roblox.GroupAnnouncements.CommunityTiersDisclosureBanner';
const DISCLOSURE_BANNER_EXPOSURE_TYPE = 'communityTiersDisclosureBanner';
const DISCLOSURE_BANNER_DISMISS_TARGET = 'communityTiersDisclosureDismiss';
const DISCLOSURE_BANNER_LEARN_MORE_TARGET = 'communityTiersDisclosureLearnMore';
const TRANSLATION_KEYS = {
  title: 'Heading.CommunityTiersDisclosureBanner',
  content: 'Description.CommunityTiersDisclosureBanner',
  learnMore: 'Action.LearnMoreLinkButton'
};

export type CommunityTiersDisclosureBannerProps = {
  groupId: number;
  isGroupMember: boolean;
  isCommunityPage: boolean;
};

type Props = CommunityTiersDisclosureBannerProps & WithTranslationsProps;

export const CommunityTiersDisclosureBanner: FC<Props> = ({
  groupId,
  isGroupMember,
  isCommunityPage,
  translate
}) => {
  const { isLoading, features } = useCommunityProductFeatures();

  const componentMetric = useMemo(() => {
    const { pageRoute, locationTab } = getCommonParams(
      window.location.hash,
      window.location.pathname
    );

    return {
      groupId,
      context: EventContext.GroupHomepage,
      pageRoute,
      locationTab,
      sessionId: getImpressionId()
    };
  }, [groupId]);

  const shouldShowBanner =
    !isLoading &&
    groupId > 0 &&
    isGroupMember &&
    isCommunityPage &&
    !!features.CommunityTiersDisclosureBanner;

  const handleDismiss = useCallback(() => {
    CommunityEventStream.sendEvent(
      CommunityMetric.GroupPageClick({
        ...componentMetric,
        clickTargetType: DISCLOSURE_BANNER_DISMISS_TARGET
      })
    );
  }, [componentMetric]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <ActionableBanner
      testId='community-tiers-disclosure-banner'
      title={translate(TRANSLATION_KEYS.title)}
      content={translate(TRANSLATION_KEYS.content)}
      isDismissedLocalStorageKey={DISMISSED_STORAGE_KEY}
      onDismiss={handleDismiss}>
      <MetricsElement
        isOneTimeEvent
        metric={CommunityMetric.GroupPageExposure({
          ...componentMetric,
          exposureType: DISCLOSURE_BANNER_EXPOSURE_TYPE
        })}
      />
      <MetricsElement
        metric={CommunityMetric.GroupPageClick({
          ...componentMetric,
          clickTargetType: DISCLOSURE_BANNER_LEARN_MORE_TARGET
        })}>
        <Button
          as='a'
          variant='Standard'
          size='Small'
          target='_blank'
          rel='noreferrer'
          className='shrink-0'
          href={COMMUNITY_TIERS_HELP_ARTICLE_URL}>
          {translate(TRANSLATION_KEYS.learnMore)}
        </Button>
      </MetricsElement>
    </ActionableBanner>
  );
};

const TranslatedCommunityTiersDisclosureBanner = withTranslations(
  CommunityTiersDisclosureBanner,
  groupsConfig
);

export const CommunityTiersDisclosureBannerWithProvider: FC<CommunityTiersDisclosureBannerProps> = ({
  groupId,
  isGroupMember,
  isCommunityPage
}) => (
  <CommunityProductFeaturesContextProvider groupId={groupId}>
    <TranslatedCommunityTiersDisclosureBanner
      groupId={groupId}
      isGroupMember={isGroupMember}
      isCommunityPage={isCommunityPage}
    />
  </CommunityProductFeaturesContextProvider>
);

export default TranslatedCommunityTiersDisclosureBanner;
