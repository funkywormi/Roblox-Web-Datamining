import type { SduiTranslateWithFallback } from "@rbx/sdui-core/client";
import type { UserSearchContext } from "./userSearchContext";

export function getContextText(
  translate: SduiTranslateWithFallback,
  context: UserSearchContext | undefined,
): string | undefined {
  if (context == null) return undefined;

  switch (context.kind) {
    case "you":
      return translate("Feature.PlayerSearchResults.Label.You", "You");
    case "previous-username":
      return translate("Feature.PlayerSearchResults.Label.NewUsername", "New username");
    case "experience":
      return context.experienceName;
    case "friend":
      return translate("Feature.Friends.Label.Friend", "Friend");
    case "connection":
      return translate("CommonUI.Features.Label.Connection", "Connection");
    case "following":
      return translate("Feature.Friends.Label.Following", "Following");
    case "mutual-friends":
      return context.count === 1
        ? translate("Feature.Friends.Label.MutualFriendTitle", "1 mutual friend")
        : translate("Feature.Friends.Label.MutualFriendsTitle", `${context.count} mutual friends`, {
            numConnections: context.count,
          });
    case "frequent":
      return translate("Feature.Friends.Label.Frequent", "Frequent");
    case "classmates":
      return translate("Feature.Schools.Label.Classmates", "Classmates");
    default:
      return undefined;
  }
}
