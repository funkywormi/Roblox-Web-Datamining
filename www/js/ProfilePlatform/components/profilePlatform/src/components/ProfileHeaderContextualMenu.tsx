import { Fragment } from "react";
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Action } from "@rbx/profile-platform";
import useIsTrustedFriendsOnWebEnabled, {
  isTrustedFriendActionHidden,
} from "./useIsTrustedFriendsOnWebEnabled";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import type { ActionMapReturnType } from "../hooks/actions/useActionMap";
import { useActionHandlers } from "../hooks/actions/useActionHandlers";

interface ProfileHeaderContextualMenuProps {
  actionMap: ActionMapReturnType;
}

const isNestedActionArray = (actions: Action[] | Action[][]): actions is Action[][] =>
  Array.isArray(actions[0]);

const ProfileHeaderContextualMenu = ({ actionMap }: ProfileHeaderContextualMenuProps) => {
  const { translate } = useTranslation();
  const { profileData } = useProfilePlatformContext();
  const { toHandlerWithAnalytics, sendContextualMenuClickEvent } = useActionHandlers();

  const trustedFriendsOnWebEnabled = useIsTrustedFriendsOnWebEnabled();

  const contextualActions: Action[] | Action[][] | undefined =
    profileData?.components.Actions?.contextual;
  if (!contextualActions || contextualActions.length === 0) {
    return null;
  }

  const sections: Action[][] = isNestedActionArray(contextualActions)
    ? contextualActions
    : [contextualActions];

  const willPopoverOpenHandlers: (() => void)[] = [];
  let globalIndex = 0;
  const menuSections = sections.map((section, sectionIndex) => {
    const items = [];
    for (const action of section) {
      if (isTrustedFriendActionHidden(action, trustedFriendsOnWebEnabled)) {
        continue;
      }
      const actionConfig = actionMap[action];
      if (actionConfig) {
        if (actionConfig.willPopoverOpen) {
          willPopoverOpenHandlers.push(actionConfig.willPopoverOpen);
        }
        const btnContext = "ContextualMenu";
        globalIndex += 1;
        const btnSortPosition = globalIndex;
        items.push(
          actionConfig.href ? (
            <MenuItem
              key={action}
              value={action}
              title={actionConfig.text}
              as="a"
              href={actionConfig.href}
              onSelect={toHandlerWithAnalytics(action, btnContext, btnSortPosition)}
            />
          ) : (
            <MenuItem
              key={action}
              value={action}
              title={actionConfig.text}
              as="button"
              onSelect={toHandlerWithAnalytics(
                action,
                btnContext,
                btnSortPosition,
                actionConfig.handler,
              )}
              disabled={actionConfig.isLoading === true || actionConfig.disabled}
            />
          ),
        );
      }
    }
    if (items.length === 0) {
      return null;
    }
    return (
      <Fragment key={section.join(",")}>
        {sectionIndex > 0 && <MenuSeparator />}
        <MenuSection>{items}</MenuSection>
      </Fragment>
    );
  });

  return (
    <div>
      <Popover
        onOpenChange={open => {
          if (open) {
            sendContextualMenuClickEvent();
          }
        }}
      >
        <PopoverTrigger asChild>
          <IconButton
            icon="icon-filled-three-dots-horizontal"
            ariaLabel={translate("Action.OpenContextualMenu")}
            size="Medium"
            variant="Standard"
            id="user-profile-header-contextual-menu-button"
            onClick={() => {
              for (const handler of willPopoverOpenHandlers) {
                handler();
              }
            }}
          />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" ariaLabel={translate("Label.ContextualMenu")}>
          <Menu size="Medium">{menuSections}</Menu>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProfileHeaderContextualMenu;
