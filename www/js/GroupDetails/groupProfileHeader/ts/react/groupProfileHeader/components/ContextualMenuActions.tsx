import React, { useCallback } from 'react';
import { Button, IconButton, Menu, MenuItem, MoreHorizIcon } from '@rbx/ui';
import { Action } from '@rbx/profile-platform';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import useProfileActions, { ProfileActionWithKey } from '../hooks/useProfileActions';
import {
  sendOverflowMenuClickEvent,
  sendOverflowMenuItemClickEvent
} from '../../shared/userActivity/groupPageEventStream';

const ContextualMenuActions: React.FC = () => {
  const { actionsData } = useGroupProfileHeaderContext();
  const { contextual } = actionsData ?? {};

  const profileActions = useProfileActions();
  const [anchor, setAnchor] = React.useState<Element | null>(null);
  const contextualActions = React.useMemo(() => {
    const mappedActions: ProfileActionWithKey[] = [];
    const contextualActionList = (contextual as Array<Action | Action[]> | undefined)?.reduce<
      Action[]
    >((actions, actionOrGroup) => {
      if (Array.isArray(actionOrGroup)) {
        return actions.concat(actionOrGroup);
      }

      actions.push(actionOrGroup);
      return actions;
    }, []);

    contextualActionList?.forEach(action => {
      const profileAction = profileActions[action];
      if (profileAction) {
        mappedActions.push({
          ...profileAction,
          onClick: () => {
            setAnchor(null);
            profileAction.onClick();
          },
          key: action
        });
      }
    });

    return mappedActions;
  }, [contextual, profileActions]);

  const handleMenuOpen = useCallback((e: React.MouseEvent) => {
    sendOverflowMenuClickEvent();
    setAnchor(e.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchor(null);
  }, []);

  if (contextualActions.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <Button
        className='contextual-menu-actions-btn'
        size='medium'
        variant='contained'
        color='secondary'
        onClick={handleMenuOpen}>
        <MoreHorizIcon />
      </Button>
      <IconButton
        className='contextual-menu-actions-btn-mobile'
        color='secondary'
        onClick={handleMenuOpen}
        aria-label='More'>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={anchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={anchor != null}
        onClose={handleMenuClose}>
        {contextualActions.map(action => (
          // Render href actions as real anchors so URL intent is explicit in DOM.
          <MenuItem
            key={action.key}
            component={action.href ? 'a' : undefined}
            href={action.href}
            className={`contextual-menu-actions-menu-item ${
              action.href ? 'contextual-menu-actions-menu-item-link' : ''
            }`}
            onClick={() => {
              sendOverflowMenuItemClickEvent(action.key);
              // href items navigate via the anchor; just close the menu.
              if (action.href) {
                handleMenuClose();
              } else {
                action.onClick();
              }
            }}>
            {action.label}
            {action.key === 'ChangeCommunityOwner' && (
              <span
                className='icon-nav-external-link-sm change-owner-action-icon'
                aria-hidden='true'
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

export default ContextualMenuActions;
