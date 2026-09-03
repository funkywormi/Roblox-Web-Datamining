import React, { Dispatch, useCallback, useState } from 'react';
import { withTranslations, WithTranslationsProps, TranslateFunction } from 'react-utilities';
import { useSystemFeedback, TSystemFeedbackService } from 'react-style-guide';
import {
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rbx/foundation-ui';
import '../../../../css/tailwind.css';
import {
  GROUP_BAN_REMOVE_CONTENT_BUTTON,
  GROUP_BAN_UNBAN_USER_BUTTON
} from '../constants/groupBanMenuConstants';
import { groupsConfig } from '../translation.config';
import { MenuAction } from '../types';
import { GroupPermissions } from '../../shared/types';

type MenuActionsProps = {
  // eslint-disable-next-line react/require-default-props
  useGroupBanMenuActions?: boolean;
  groupId: number;
  userId: number;
  // eslint-disable-next-line react/require-default-props
  actingUserPermissions?: GroupPermissions;
  setShowUserCard: Dispatch<React.SetStateAction<boolean>>;
} & WithTranslationsProps;

async function handleActionClick(
  action: MenuAction,
  groupId: number,
  userId: number,
  translate: TranslateFunction,
  setShowUserCard: Dispatch<React.SetStateAction<boolean>>,
  systemFeedbackService: TSystemFeedbackService
) {
  const success = await action.onClick({
    groupId,
    userId
  });

  if (success) {
    action.onSuccess({
      translate,
      systemFeedbackService,
      setShowUserCard
    });
  } else {
    action.onError({
      translate,
      systemFeedbackService,
      setShowUserCard
    });
  }
}

const MenuActions = (props: MenuActionsProps) => {
  const {
    useGroupBanMenuActions,
    groupId,
    userId,
    translate,
    actingUserPermissions,
    setShowUserCard
  } = props;
  const menuActions: MenuAction[] = [];
  const { systemFeedbackService } = useSystemFeedback();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onSelectAction = useCallback(
    (action: MenuAction) => {
      setIsMenuOpen(false);
      // eslint-disable-next-line no-void
      void handleActionClick(
        action,
        groupId,
        userId,
        translate,
        setShowUserCard,
        systemFeedbackService
      );
    },
    [groupId, userId, translate, setShowUserCard, systemFeedbackService]
  );

  if (useGroupBanMenuActions) {
    if (actingUserPermissions?.groupMembershipPermissions.banMembers) {
      menuActions.push(GROUP_BAN_UNBAN_USER_BUTTON);
    }

    if (actingUserPermissions?.groupPostsPermissions.deleteFromWall) {
      menuActions.push(GROUP_BAN_REMOVE_CONTENT_BUTTON);
    }
  }

  return (
    <React.Fragment>
      {menuActions && menuActions.length > 0 && (
        <div className='avatar-card-menu group-menu'>
          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <IconButton
                icon='icon-filled-three-dots-horizontal'
                variant='Utility'
                size='Small'
                ariaLabel={translate('Action.More')}
              />
            </PopoverTrigger>
            <PopoverContent ariaLabel={translate('Label.OverflowMenu')} side='bottom' align='end'>
              <Menu size='Medium'>
                <MenuSection>
                  {menuActions.map(action => (
                    <MenuItem
                      key={action.translationKey}
                      id={action.id}
                      value={action.translationKey}
                      title={translate(action.translationKey)}
                      onSelect={() => onSelectAction(action)}
                    />
                  ))}
                </MenuSection>
              </Menu>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </React.Fragment>
  );
};

export default withTranslations(MenuActions, groupsConfig);
