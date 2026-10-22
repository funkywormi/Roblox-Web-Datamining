import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import realTime from "@rbx/core-scripts/realtime";
import { UncheckedBadge, showUncheckedBadge } from "@rbx/identity-badges";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { useLiveUserNameForDisplay } from "./hooks/useLiveUserNameForDisplay";
import { usePlusNavEntries } from "./leftNav/new/PlusNavEntries";
import { useCommunitiesEntrypointTelemetry } from "./leftNav/useCommunitiesEntrypointTelemetry";
import { trackOpenToVisible, withApiMetrics } from "./leftNav/observability";
import { logLeftNavExposure } from "./util/leftNavIxpUtil";
import { registerNavCapabilities } from "./util/navCapabilities";

const AvatarHeadshot = ({
  userId,
  altName,
  containerClass,
}: {
  userId: number;
  altName?: string;
  containerClass?: string;
}) => (
  <Thumbnail2d
    containerClass={containerClass}
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
  useCommunitiesEntrypointTelemetry,
  usePlusNavEntries,
  logLeftNavExposure,
  trackOpenToVisible,
});
