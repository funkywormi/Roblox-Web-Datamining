import { Button } from "@rbx/foundation-ui";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import useIsTrustedFriendsOnWebEnabled, {
  isTrustedFriendActionHidden,
} from "./useIsTrustedFriendsOnWebEnabled";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import type { ActionMapReturnType } from "../hooks/actions/useActionMap";
import { useActionHandlers } from "../hooks/actions/useActionHandlers";

interface ProfileHeaderButtonsProps {
  actionMap: ActionMapReturnType;
}

const ProfileHeaderButtons = ({ actionMap }: ProfileHeaderButtonsProps) => {
  const { profileData, profileId } = useProfilePlatformContext();
  const { toHandlerWithAnalytics } = useActionHandlers();

  const trustedFriendsOnWebEnabled = useIsTrustedFriendsOnWebEnabled();

  const buttons = profileData?.components.Actions?.buttons;
  if (!buttons || buttons.length === 0) {
    return null;
  }

  const buttonConfigs = [];
  for (const button of buttons) {
    const key = button.type;
    if (isTrustedFriendActionHidden(key, trustedFriendsOnWebEnabled)) {
      continue;
    }
    const actionConfig = actionMap[key];
    if (actionConfig) {
      buttonConfigs.push({
        ...actionConfig,
        key,
        disabledReason: button.disabledReason,
      });
    }
  }

  if (buttonConfigs.length === 0) {
    return null;
  }

  const currentUser = authenticatedUser();
  const isSelfView = currentUser && `${currentUser.id}` === profileId;

  const buttonItems = buttonConfigs.map((buttonConfig, index) => {
    const { key, disabledReason, href, handler, text, variant, isLoading } = buttonConfig;
    const id = `user-profile-header-${key}`;
    const size = "Medium";
    const isDisabled = disabledReason != null || isLoading === true;
    const style = { width: "100%" };
    const fallbackVariant = isSelfView || index > 0 ? "Standard" : "Emphasis";
    const buttonVariant = variant ?? fallbackVariant;
    const btnContext = "Buttons";
    const btnSortPosition = index + 1;

    return buttonConfig.href ? (
      <Button
        id={id}
        key={key}
        size={size}
        isDisabled={isDisabled}
        style={style}
        variant={buttonVariant}
        as="a"
        href={href}
        onClick={toHandlerWithAnalytics(key, btnContext, btnSortPosition)}
      >
        {text}
      </Button>
    ) : (
      <Button
        id={id}
        key={key}
        size={size}
        isDisabled={isDisabled}
        style={style}
        variant={buttonVariant}
        as="button"
        onClick={toHandlerWithAnalytics(key, btnContext, btnSortPosition, handler)}
      >
        {text}
      </Button>
    );
  });

  return <div className="button-container flex gap-small">{buttonItems}</div>;
};

export default ProfileHeaderButtons;
