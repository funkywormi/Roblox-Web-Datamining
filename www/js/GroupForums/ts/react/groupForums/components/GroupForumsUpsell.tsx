import React, { useCallback, useState } from 'react';
import { CurrentUser } from 'Roblox';
import { Button, Icon } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { groupsConfig } from '../translation.config';
import { Group } from '../../shared/types';
import forumsService from '../services/forumsService';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import useCommunityTier from '../../shared/communityTier/useCommunityTier';
import { CommunityTierValues } from '../../shared/communityTier/types';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import communityTierConstants, {
  RequirementKeys
} from '../../shared/communityTier/communityTierConstants';

export type GroupForumsUpsellProps = {
  group: Group;
  onFinished: () => void;
} & WithTranslationsProps;

/**
 * The requirements worth calling out on the forums upsell, and the label to show
 * for each. Requirements outside this map are covered by the Community Tier page.
 */
const FORUMS_REQUIREMENT_LABEL_KEYS: Record<string, string> = {
  [RequirementKeys.ownerModerationStatusOk]: 'Label.ActiveMembership',
  [RequirementKeys.ownerAgeEstimationVerified]: 'Label.OwnerAgeChecked'
};

const goToCommunityTier = () => {
  window.location.hash = `#!/${communityTierConstants.configureMenuOptionName}`;
};

const GroupForumsUpsell = ({
  group,
  onFinished,
  translate
}: GroupForumsUpsellProps): JSX.Element | null => {
  const { systemFeedbackService } = useSystemFeedback();
  const { features, isLoading: isLoadingFeatures } = useCommunityProductFeatures();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { tierInfo, isLoading: isLoadingTier } = useCommunityTier(group.id);

  const forumsGetStarted = useCallback(async () => {
    try {
      setIsCreating(true);
      await Promise.all([
        forumsService.createGroupForumCategory(group.id, translate('Label.HelpAndSupport')),
        forumsService.createGroupForumCategory(group.id, translate('Label.Feedback')),
        forumsService.createGroupForumCategory(group.id, translate('Label.GeneralDiscussions'))
      ]);
      logGroupForumsClickEvent({
        groupId: group.id,
        clickTargetType: 'forumsGetStarted'
      });
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    } finally {
      onFinished();
      setIsCreating(false);
    }
  }, [group.id, translate, setIsCreating, onFinished, systemFeedbackService]);

  /**
   * Gate only when Community Tiers is live for this community *and* we know its
   * tier. `tierInfo` is null when the backend reported no tier and undefined
   * while loading or on error; treating either as Basic would switch on a
   * brand-new restriction for communities that could previously open forums.
   */
  const isTierGated =
    features.CommunityTiers === true &&
    tierInfo != null &&
    tierInfo.currentTier < CommunityTierValues.Social;

  /**
   * Until both checks settle we cannot know whether this community is gated, and
   * Get Started fires three category-creation requests that cannot be taken back.
   * Hold the action rather than let a Basic community slip a click through.
   */
  const isGateResolving = isLoadingFeatures || isLoadingTier;

  const forumsRequirements =
    tierInfo?.requirements.filter(
      requirement => FORUMS_REQUIREMENT_LABEL_KEYS[requirement.requirementKey]
    ) ?? [];

  // The Community Tier page is owner-only, so only an owner gets sent there.
  const isOwner =
    group.owner?.userId !== undefined && group.owner.userId === Number(CurrentUser.userId);

  return (
    <div className='section-content'>
      <div className='group-forums-upsell-container' data-testid='group-forums-upsell'>
        <div className='group-forums-upsell-banner' />
        {isTierGated ? (
          <React.Fragment>
            <h2 data-testid='group-forums-tier-gate-heading'>
              {translate('Heading.ForumsNotAvailable')}
            </h2>
            <span className='text-label'>{translate('Description.ForumsNotAvailable')}</span>
            <div className='group-forums-tier-requirements'>
              {forumsRequirements.map(requirement => (
                <span
                  key={requirement.requirementKey}
                  className='group-forums-tier-requirement'
                  data-testid={`group-forums-tier-requirement-${requirement.requirementKey}`}
                  // Met-ness as an attribute rather than only an icon class, so
                  // tests assert the requirement state without coupling to
                  // Foundation's icon names or status colour classes.
                  data-requirement-met={String(requirement.isMet)}>
                  <Icon
                    aria-hidden='true'
                    name={requirement.isMet ? 'icon-regular-circle-check' : 'icon-regular-circle-x'}
                    size='Medium'
                    className={
                      requirement.isMet ? 'content-system-success' : 'content-system-alert'
                    }
                  />
                  {translate(FORUMS_REQUIREMENT_LABEL_KEYS[requirement.requirementKey])}
                </span>
              ))}
            </div>
            {isOwner && (
              <Button
                type='button'
                variant='Emphasis'
                size='Medium'
                className='group-forums-start-button'
                data-testid='group-forums-tier-gate-continue-button'
                onClick={goToCommunityTier}>
                {translate('Action.Continue')}
              </Button>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h2 data-testid='group-forums-upsell-heading'>{translate('Heading.ForumsUpsell')}</h2>
            <span className='text-label'>{translate('Description.ForumsUpsell')}</span>
            <Button
              // Spinner only while the categories are actually being created.
              // `isGateResolving` disables without a spinner: the click must be
              // held until the tier is known, but nothing is in flight yet.
              isLoading={isCreating}
              isDisabled={isCreating || isGateResolving}
              type='button'
              variant='Emphasis'
              size='Medium'
              className='group-forums-start-button'
              data-testid='group-forums-get-started-button'
              onClick={forumsGetStarted}>
              {translate('Action.GetStarted')}
            </Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default withTranslations(GroupForumsUpsell, groupsConfig);
