import { Tooltip } from "@rbx/core-ui";
import { Badge } from "@rbx/foundation-ui";
import {
  type BadgeConfig,
  FRIEND_COUNT_BADGE,
  LANGUAGE_MATCH_BADGE,
  PING_SIGNAL_BADGES,
  type PingSignalLevel,
  type ServerMetaIconId,
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
  idPrefix: string;
  icons: readonly ServerMetaIconId[];
  languageMatchCount: number | null;
  friendCount: number | null;
  translate: TranslateFunction;
};

function ServerMetaIcons({
  idPrefix,
  icons,
  languageMatchCount,
  friendCount,
  translate,
}: ServerMetaIconsProps) {
  const renderBadge = (icon: ServerMetaIconId) => {
    if (icon.startsWith("Ping.")) {
      const level = icon.split(".")[1] as PingSignalLevel;
      return (
        <ServerMetaBadge
          key={icon}
          badge={PING_SIGNAL_BADGES[level]}
          id={`${idPrefix}-ping-tooltip`}
          translate={translate}
        />
      );
    }
    if (icon === "LanguageMatch") {
      return (
        <ServerMetaBadge
          key={icon}
          badge={LANGUAGE_MATCH_BADGE}
          id={`${idPrefix}-language-tooltip`}
          translate={translate}
          label={String(languageMatchCount)}
        />
      );
    }
    return (
      <ServerMetaBadge
        key={icon}
        badge={FRIEND_COUNT_BADGE}
        id={`${idPrefix}-friends-tooltip`}
        translate={translate}
        label={String(friendCount)}
      />
    );
  };

  return <div className="server-meta-icons">{icons.map(renderBadge)}</div>;
}

export default ServerMetaIcons;
