"use client";

import type { SduiRendererInjectedProps, SduiResolvedAction } from "@rbx/sdui-core";
import { useSduiTranslateWithFallback } from "@rbx/sdui-core/client";
import { getCurrentUser, parseUserId } from "@rbx/www-common/user";
import { AuthenticatedUserSearchTile } from "./components/AuthenticatedUserSearchTile";
import { BaseUserSearchTile } from "./components/BaseUserSearchTile";
import { getContextText } from "./getContextText";

export interface SduiUserSearchTileProps extends SduiRendererInjectedProps {
  userId?: string;
  name?: string;
  displayName?: string;
  image?: string;
  isPreviousUsernameMatch?: boolean;
  onActivated?: SduiResolvedAction;
  source?: string;
}

export function SduiUserSearchTile({
  analyticsContext,
  displayName,
  image,
  isPreviousUsernameMatch,
  name,
  onActivated,
  source,
  userId,
}: SduiUserSearchTileProps): React.JSX.Element | null {
  const translate = useSduiTranslateWithFallback();
  const targetUserId = userId == null ? null : parseUserId(userId.trim());
  if (targetUserId == null) return null;

  const viewerUserId = getCurrentUser()?.id;
  if (viewerUserId == null) {
    return (
      <BaseUserSearchTile
        analyticsContext={analyticsContext}
        contextText={
          isPreviousUsernameMatch
            ? getContextText(translate, { kind: "previous-username" })
            : undefined
        }
        displayName={displayName}
        image={image}
        isOnline={false}
        name={name}
        onActivated={onActivated}
      />
    );
  }

  if (viewerUserId === targetUserId) {
    return (
      <BaseUserSearchTile
        analyticsContext={analyticsContext}
        contextText={getContextText(translate, { kind: "you" })}
        displayName={displayName}
        image={image}
        isOnline={false}
        name={name}
        onActivated={onActivated}
      />
    );
  }

  return (
    <AuthenticatedUserSearchTile
      analyticsContext={analyticsContext}
      displayName={displayName}
      image={image}
      isPreviousUsernameMatch={isPreviousUsernameMatch}
      name={name}
      onActivated={onActivated}
      source={source}
      targetUserId={targetUserId}
      viewerUserId={viewerUserId}
    />
  );
}
