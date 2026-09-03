import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { Button, Tooltip } from '@rbx/ui';
import { DisabledReason } from '@rbx/profile-platform';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import useProfileActions, { ProfileActionWithKey } from '../hooks/useProfileActions';
import ContextualMenuActions from './ContextualMenuActions';
import { useVerificationModal } from '../context/VerificationModalContext';
import { VerificationLevel } from '../constants/verificationConstants';

type ActionsProps = {
  className?: string;
  includeContextualMenu?: boolean;
  showTooltipAsText?: boolean;
};

const Actions: React.FC<ActionsProps> = ({
  className = '',
  includeContextualMenu = true,
  showTooltipAsText = false
}) => {
  const { translate } = useTranslation();
  const { actionsData, isGroupVerificationRequiredToJoin } = useGroupProfileHeaderContext();
  const { openVerificationModal } = useVerificationModal();
  const { buttons } = actionsData ?? {};

  const profileActions = useProfileActions();

  const disabledReasonTooltips = useMemo<{ [key in DisabledReason]: string }>(() => {
    return {
      [DisabledReason.BannedFromCommunity]: translate('Message.BannedFromGroup'),
      [DisabledReason.CommunityIsClosed]: translate('Label.GroupClosed'),
      [DisabledReason.MaxCommunitiesJoined]: translate('Description.PremiumMaxGroups'),
      [DisabledReason.AccountCreatedLessThanOneDay]: translate(
        'Description.RequiresAccountTenureTooltip',
        { numDays: 1 }
      ),
      [DisabledReason.AccountCreatedLessThanThreeDays]: translate(
        'Description.RequiresAccountTenureTooltip',
        { numDays: 3 }
      ),
      [DisabledReason.AccountCreatedLessThanOneWeek]: translate(
        'Description.RequiresAccountTenureTooltip',
        { numDays: 7 }
      ),
      [DisabledReason.AccountCreatedLessThanOneMonth]: translate(
        'Description.RequiresAccountTenureTooltip',
        { numDays: 30 }
      ),
      [DisabledReason.AccountCreatedLessThanThreeMonths]: translate(
        'Description.RequiresAccountTenureTooltip',
        { numDays: 90 }
      ),
      // Verification tooltips are not used (modals are shown instead), but included for type safety
      [DisabledReason.InsufficientVerificationLevelLow]: translate('Description.VerificationLow'),
      [DisabledReason.InsufficientVerificationLevelMedium]: translate(
        'Description.VerificationMedium'
      ),
      [DisabledReason.InsufficientVerificationLevelHigh]: translate('Description.VerificationHigh'),
      [DisabledReason.AlwaysDisabled]: translate('Message.FeatureDisabled'),
      // BlockedByProfileOwner / DeletedProfile are profile-level disable reasons added in
      // @rbx/profile-platform 7.15.x. Group actions (Join/Leave/Invite/etc.) don't surface
      // these in practice, but the `[key in DisabledReason]` map must stay exhaustive.
      [DisabledReason.BlockedByProfileOwner]: translate('Message.FeatureDisabled'),
      [DisabledReason.DeletedProfile]: translate('Message.FeatureDisabled')
    };
  }, [translate]);

  const getVerificationLevel = useCallback(
    (disabledReason: DisabledReason): VerificationLevel | null => {
      switch (disabledReason) {
        case DisabledReason.InsufficientVerificationLevelLow:
          return VerificationLevel.LOW;
        case DisabledReason.InsufficientVerificationLevelMedium:
          return VerificationLevel.MEDIUM;
        case DisabledReason.InsufficientVerificationLevelHigh:
          return VerificationLevel.HIGH;
        default:
          return null;
      }
    },
    []
  );

  const actions = useMemo(() => {
    const mappedActions: ProfileActionWithKey[] = [];

    buttons?.forEach(action => {
      const profileAction = profileActions[action.type];
      if (profileAction) {
        const verificationLevel = action.disabledReason
          ? getVerificationLevel(action.disabledReason)
          : null;
        const isVerificationNeeded =
          isGroupVerificationRequiredToJoin && verificationLevel !== null;

        mappedActions.push({
          ...profileAction,
          disabled: profileAction.disabled || (!!action.disabledReason && !isVerificationNeeded),
          tooltip:
            action.disabledReason && !isVerificationNeeded
              ? disabledReasonTooltips[action.disabledReason]
              : undefined,
          onClick:
            isVerificationNeeded && verificationLevel
              ? () => openVerificationModal(verificationLevel)
              : profileAction.onClick,
          key: action.type,
          needsVerification: isVerificationNeeded
        });
      }
    });

    return mappedActions;
  }, [
    buttons,
    profileActions,
    disabledReasonTooltips,
    openVerificationModal,
    getVerificationLevel,
    isGroupVerificationRequiredToJoin
  ]);

  const renderButton = useCallback(
    (action: ProfileActionWithKey) => {
      const buttonContent = (
        <React.Fragment>
          {action.needsVerification && (
            <span className='icon-status-private-primary actions-verification-icon' />
          )}
          {action.label}
          {action.key === 'ChangeCommunityOwner' && (
            <span
              className='icon-nav-external-link-sm change-owner-action-icon'
              aria-hidden='true'
            />
          )}
        </React.Fragment>
      );

      const button = (
        <div className='actions-btn-container'>
          <Button
            key={action.key}
            className={`actions-btn ${action.needsVerification ? 'actions-btn-verification' : ''}`}
            size='medium'
            variant={action.btnVariant}
            color={action.btnColor}
            onClick={action.onClick}
            disabled={action.disabled}>
            {buttonContent}
          </Button>
          {showTooltipAsText && action.tooltip && (
            <div className='actions-tooltip-text text-secondary text-body-small'>
              {action.tooltip}
            </div>
          )}
        </div>
      );

      if (action.tooltip && !showTooltipAsText) {
        return (
          <Tooltip arrow title={action.tooltip}>
            {button}
          </Tooltip>
        );
      }

      return button;
    },
    [showTooltipAsText]
  );

  if (!actionsData || (actions.length === 0 && !includeContextualMenu)) {
    return null;
  }

  return (
    <div className={`actions-container flex gap-small ${className}`}>
      {actions?.map(action => renderButton(action))}
      {includeContextualMenu && <ContextualMenuActions />}
    </div>
  );
};

export default Actions;
