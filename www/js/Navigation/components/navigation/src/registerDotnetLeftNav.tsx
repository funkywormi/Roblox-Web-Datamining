import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import realTime from "@rbx/core-scripts/realtime";
import { UncheckedBadge, showUncheckedBadge } from "@rbx/identity-badges";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import {
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  useEntrypointImpressionId,
} from "@rbx/community-telemetry";
import { useLiveUserNameForDisplay } from "./hooks/useLiveUserNameForDisplay";
import { usePlusNavEntries } from "./leftNav/new/PlusNavEntries";
import { trackOpenToVisible, withApiMetrics } from "./leftNav/observability";
import { logLeftNavExposure } from "./util/leftNavIxpUtil";
import { registerNavCapabilities } from "./util/navCapabilities";

const LEFT_NAV_CONTEXT = "leftNav";
const LEFT_NAV_ENTRY_POINT = "leftNav";

const AvatarHeadshot = ({ userId, altName }: { userId: number; altName: string }) => (
  <Thumbnail2d
    targetId={userId}
    type={ThumbnailTypes.avatarHeadshot}
    altName={altName}
    includeProfileFrame
  />
);

const getCount = (url: string) =>
  http.get<{ count: number }>({ url, withCredentials: true }).then(({ data }) => data.count);

registerNavCapabilities({
  getFriendRequestCount: () =>
    withApiMetrics("FriendRequestCount", () =>
      getCount(`${environmentUrls.friendsApi}/v1/user/friend-requests/count`),
    ),
  getMessageUnreadCount: () =>
    withApiMetrics("MessageUnreadCount", () =>
      getCount(`${environmentUrls.privateMessagesApi}/v1/messages/unread/count`),
    ),
  getTradeInboundCount: () =>
    withApiMetrics("TradeInboundCount", () =>
      getCount(`${environmentUrls.tradesApi}/v1/trades/inbound/count`),
    ),
  subscribeRealTime: (event, callback) => {
    const client = realTime.GetClient();
    client.Subscribe(event, callback);
    return () => {
      client.Unsubscribe(event, callback);
    };
  },
  useLiveUserNameForDisplay: user => useLiveUserNameForDisplay(user),
  AvatarHeadshot,
  UncheckedBadge,
  shouldShowUncheckedBadge: showUncheckedBadge,
  useCommunitiesEntrypointTelemetry: () => {
    const entrypointImpressionId = useEntrypointImpressionId();
    return {
      onExpose: () => {
        logCmntyEntrypointExposureEvent({
          context: LEFT_NAV_CONTEXT,
          entryPoint: LEFT_NAV_ENTRY_POINT,
          entrypointImpressionId,
        });
      },
      onClick: () => {
        logCmntyEntrypointClickEvent({
          context: LEFT_NAV_CONTEXT,
          entryPoint: LEFT_NAV_ENTRY_POINT,
          entrypointImpressionId,
        });
      },
    };
  },
  usePlusNavEntries,
  logLeftNavExposure,
  trackOpenToVisible,
});
