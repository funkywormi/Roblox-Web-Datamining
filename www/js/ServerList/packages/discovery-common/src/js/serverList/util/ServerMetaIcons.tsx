import { Tooltip } from "@rbx/core-ui";
import { Badge } from "@rbx/foundation-ui";
import {
  type BadgeConfig,
  FRIEND_COUNT_BADGE,
  LANGUAGE_MATCH_BADGE,
  PING_SIGNAL_BADGES,
  isPingSignalLevel,
  type PingSignalLevel,
} from "./serverCardMeta";

type TranslateFunction = (resource: string, params?: Record<string, unknown>) => string;

type ServerMetaBadgeProps = {
  badge: BadgeConfig;
  id: string;
  translate: TranslateFunction;
  label?: string;
};

function ServerMetaBadge({ badge, id, translate, label }: ServerMetaBadgeProps) {
  return (
    <Tooltip
      id={id}
      placement="top"
      content={translate(badge.tooltipResource) || badge.defaultTooltip}
      containerClassName="server-meta-badge-tip"
    >
      <Badge variant="Neutral" size="Small" icon={badge.icon} label={label} />
    </Tooltip>
  );
}

type ServerMetaIconsProps = {
  pingSignalLevel: PingSignalLevel | null;
  languageMatchCount: number | null;
  friendCount: number | null;
  showPing: boolean;
  showLanguage: boolean;
  showFriends: boolean;
  translate: TranslateFunction;
};

function ServerMetaIcons({
  pingSignalLevel,
  languageMatchCount,
  friendCount,
  showPing,
  showLanguage,
  showFriends,
  translate,
}: ServerMetaIconsProps) {
  return (
    <div className="server-meta-icons">
      {showPing && isPingSignalLevel(pingSignalLevel) && (
        <ServerMetaBadge
          badge={PING_SIGNAL_BADGES[pingSignalLevel]}
          id="server-ping-tooltip"
          translate={translate}
        />
      )}
      {showLanguage && languageMatchCount != null && languageMatchCount > 0 && (
        <ServerMetaBadge
          badge={LANGUAGE_MATCH_BADGE}
          id="server-language-tooltip"
          translate={translate}
          label={String(languageMatchCount)}
        />
      )}
      {showFriends && friendCount != null && friendCount > 0 && (
        <ServerMetaBadge
          badge={FRIEND_COUNT_BADGE}
          id="server-friends-tooltip"
          translate={translate}
          label={String(friendCount)}
        />
      )}
    </div>
  );
}

export default ServerMetaIcons;
