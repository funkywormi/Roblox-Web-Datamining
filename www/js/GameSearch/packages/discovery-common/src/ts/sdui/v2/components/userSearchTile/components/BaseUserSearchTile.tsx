"use client";

import classNames from "classnames";
import type { AnalyticsContext, SduiResolvedAction } from "@rbx/sdui-core";
import { SduiBadgeTile } from "@rbx/sdui-client";
import { SduiSlotOverlay } from "../../SduiSlotOverlay";
import { UserSearchTileFooter } from "./UserSearchTileFooter";

const CIRCULAR_RADIUS = { kind: "numeric", value: 9999 } as const;
const ZERO_PADDING = { kind: "numeric", value: 0 } as const;
const THUMBNAIL_PADDING = { kind: "numeric", value: 5 } as const;
const OVERLAY_PADDING = { kind: "numeric", value: 10 } as const;
const TITLE_FONT = { kind: "token", value: "Typography.TitleLarge" } as const;
const THUMBNAIL_BACKGROUND = {
  kind: "token",
  value: "Color.Shift.Shift_300",
} as const;

export interface BaseUserSearchTileProps {
  actionComponent?: React.ReactNode;
  analyticsContext?: AnalyticsContext;
  contextText?: string;
  displayName?: string;
  image?: string;
  isOnline: boolean;
  name?: string;
  onActivated?: SduiResolvedAction;
}

export function BaseUserSearchTile({
  actionComponent,
  analyticsContext,
  contextText,
  displayName,
  image,
  isOnline,
  name,
  onActivated,
}: BaseUserSearchTileProps): React.JSX.Element {
  const username = name?.trim() ?? "";
  const visibleName = displayName?.trim() || username;

  return (
    <div
      data-sdui-user-search-tile
      className={classNames({
        "[&_.sdui-tile-title::before]:[content:'']": isOnline,
        "[&_.sdui-tile-title::before]:inline-block": isOnline,
        "[&_.sdui-tile-title::before]:size-200": isOnline,
        "[&_.sdui-tile-title::before]:radius-circle": isOnline,
        "[&_.sdui-tile-title::before]:bg-system-success": isOnline,
        "[&_.sdui-tile-title::before]:[margin-inline-end:var(--size-100)]": isOnline,
      })}
    >
      <SduiBadgeTile
        analyticsContext={analyticsContext}
        ariaLabel={visibleName}
        cornerRadius={CIRCULAR_RADIUS}
        footerComponent={<UserSearchTileFooter contextText={contextText} username={username} />}
        image={image}
        imageAspectRatio={1}
        imageCornerRadius={CIRCULAR_RADIUS}
        imagePadding={ZERO_PADDING}
        isContained={false}
        onActivated={onActivated}
        thumbnailBackgroundStyle={THUMBNAIL_BACKGROUND}
        thumbnailOverlayComponent={
          actionComponent == null ? undefined : (
            <SduiSlotOverlay bottomRightSlot={actionComponent} padding={OVERLAY_PADDING} />
          )
        }
        thumbnailPadding={THUMBNAIL_PADDING}
        titleFont={TITLE_FONT}
        titleText={visibleName}
        titleTextXAlignment="center"
      />
    </div>
  );
}
