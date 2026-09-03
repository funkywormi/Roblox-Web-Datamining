import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-utilities';
import Banner from '../../shared/components/Banner';
import forumsService from '../../groupForums/services/forumsService';
import groupForumsConstants from '../../groupForums/constants/groupForumsConstants';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';

const FORUMS_ENABLED_UPSELL_DISMISSED_KEY =
  'Roblox.Groups.BugReportingForumsEnabledUpsellDismissed';
const ENABLE_FORUMS_UPSELL_DISMISSED_KEY = 'Roblox.Groups.BugReportingEnableForumsUpsellDismissed';

/**
 * Community-homepage discovery banner for the Forums bug-reporting feature, shown below the group
 * description. Two variants:
 *  - Variant A — forums already enabled: promotes turning forum bug reports into tickets.
 *  - Variant B — forums not enabled: prompts the owner to enable forums first.
 */
const BugReportingHomeUpsell: React.FC = () => {
  const { translate } = useTranslation();
  const { groupId } = useGroupProfileHeaderContext();
  const { features } = useCommunityProductFeatures();
  const isBugReportingRolledOut = features.ForumsAttachmentsCreate ?? false;

  const { data: forumsEnabled } = useQuery({
    queryKey: ['groupForumsEnabled', groupId],
    queryFn: async () => {
      const response = await forumsService.getGroupForumCategories(groupId, false);
      return response.data.length > 0;
    },
    enabled: isBugReportingRolledOut,
    refetchOnWindowFocus: false,
    retry: 1
  });

  if (!isBugReportingRolledOut || forumsEnabled === undefined) {
    return null;
  }

  const forumsConfigUrl = groupForumsConstants.urls.getConfigureGroupForumsSectionUrl(groupId);

  if (forumsEnabled) {
    return (
      <Banner
        title={translate('Heading.BugReportingForumsEnabledUpsell')}
        content={translate('Description.BugReportingForumsEnabledUpsell')}
        flavor='flat'
        iconName='icon-filled-butterfly-wings'
        buttonText={translate('Action.BugReportingTurnOn')}
        buttonHref={forumsConfigUrl}
        isDismissedLocalStorageKey={FORUMS_ENABLED_UPSELL_DISMISSED_KEY}
      />
    );
  }

  return (
    <Banner
      title={translate('Heading.BugReportingEnableForumsUpsell')}
      content={translate('Description.BugReportingEnableForumsUpsell')}
      flavor='flat'
      iconName='icon-filled-diamond-simplified'
      buttonText={translate('Action.BugReportingTurnOn')}
      buttonHref={forumsConfigUrl}
      isDismissedLocalStorageKey={ENABLE_FORUMS_UPSELL_DISMISSED_KEY}
    />
  );
};

BugReportingHomeUpsell.displayName = 'BugReportingHomeUpsell';

export default BugReportingHomeUpsell;
