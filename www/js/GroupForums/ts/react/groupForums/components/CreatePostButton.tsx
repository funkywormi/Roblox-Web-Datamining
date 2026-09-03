import React from 'react';
import { Button } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import ConditionalTooltip from '../../shared/components/ConditionalTooltip';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import useForumStore from '../hooks/useForumStore';
import useForumTierGate from '../hooks/useForumTierGate';

export type CreatePostButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: (() => void) | (() => Promise<void>);
} & WithTranslationsProps;

const CreatePostButton = ({
  label,
  disabled,
  onClick,
  translate
}: CreatePostButtonProps): JSX.Element => {
  const { isGroupMember, canCreatePost } = useForumPermissions();
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const { forumsWrite } = useCommunityFeatureFreezes();
  const { isTierGated } = useForumTierGate();

  let tooltipContent;
  if (disabled) {
    if (forumsWrite.isDisabled) {
      tooltipContent = translate('Description.CreatePostDisabled');
    } else if (isTierGated) {
      tooltipContent = translate('Description.TierGatedForumWrite');
    } else if (isCategoryArchived) {
      tooltipContent = translate('Description.CategoryArchived');
    } else if (isGroupMember && !canCreatePost) {
      tooltipContent = translate('Description.NoPostPermission');
    } else if (!isGroupMember) {
      tooltipContent = translate('Description.JoinCommunityFirst');
    }
  }

  const buttonId = 'create-post-button';
  const tooltipId = `${buttonId}-tooltip`;

  return (
    <ConditionalTooltip
      id={tooltipId}
      content={tooltipContent}
      position='top-center'
      enabled={!!tooltipContent}
      containerClassName='group-forums-create-post-btn-tooltip-container'>
      <Button
        id={buttonId}
        type='button'
        variant='Emphasis'
        size='Medium'
        className='group-forums-create-post-btn'
        onClick={onClick}
        isDisabled={disabled}
        aria-describedby={tooltipContent ? tooltipId : undefined}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}>
        {label}
      </Button>
    </ConditionalTooltip>
  );
};

CreatePostButton.displayName = 'CreatePostButton';

export default withTranslations(CreatePostButton, groupsConfig);
