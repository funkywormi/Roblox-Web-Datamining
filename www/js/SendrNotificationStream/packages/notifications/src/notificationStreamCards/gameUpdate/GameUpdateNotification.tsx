import React, { useRef, useState } from "react";
import {
  Notification,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "roblox-thumbnails";
import { useNotificationLocalization } from "../../sendrNotificationStream/context/NotificationsLocalization";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import { GameUpdateHandlers, GameUpdateViewModel } from "./types";
import "./gameUpdateNotification.css";

// Substituted for {gameOne}/{gameTwo} so the translated aggregated string can be split and
// the game names swapped for bold React nodes (Angular uses ng-bind-html; avoids escaping raw HTML).
const AGG_TOKENS = ["%%G0%%", "%%G1%%"];
const AGG_TOKEN_SPLIT = new RegExp(
  `(${AGG_TOKENS.map(token => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
);

// Overflow kebab (G3): foundation IconButton + Popover + Menu, passed to the card's trailing slot.
// Unfollow + Report; Cancel = dismiss (outside-click/Esc).
const GameUpdateKebab = ({
  gameName,
  onUnfollow,
  onReport,
  onOpenChange,
  isUnfollowPending,
}: {
  gameName: string;
  onUnfollow: () => void;
  onReport: () => void;
  onOpenChange?: (open: boolean) => void;
  isUnfollowPending?: boolean;
}): JSX.Element => {
  const translate = useNotificationLocalization();
  const [open, setOpen] = useState(false);
  const handleOpenChange = (next: boolean): void => {
    if (next !== open) {
      onOpenChange?.(next);
    }
    setOpen(next);
  };
  return (
    // stopPropagation so opening the menu doesn't trigger the whole-card click (mark-read + nav).
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span onClick={e => e.stopPropagation()}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <IconButton
            className="bg-none"
            icon="icon-regular-three-dots-vertical"
            ariaLabel={translate("Label.Options")}
            variant="Standard"
            size="Medium"
          />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" ariaLabel={translate("Label.Options")}>
          <Menu size="Small">
            <MenuItem
              value="unfollow"
              disabled={isUnfollowPending}
              title={translate("Action.UnfollowGame", { gameName })}
              onSelect={() => {
                handleOpenChange(false);
                onUnfollow();
              }}
            />
            <MenuItem
              value="report"
              title={translate("Action.ReportAbuse")}
              onSelect={() => {
                handleOpenChange(false);
                onReport();
              }}
            />
          </Menu>
        </PopoverContent>
      </Popover>
    </span>
  );
};

export type GameUpdateNotificationProps = {
  viewModel: GameUpdateViewModel;
  handlers: GameUpdateHandlers;
};

// Game icon linked to details (media slot). Split out so the empty-universe case is null.
const GameUpdateThumbnail = ({
  viewModel,
  onClick,
}: {
  viewModel: GameUpdateViewModel;
  onClick: () => void;
}): JSX.Element | null => {
  if (viewModel.universeId == null) {
    return null;
  }
  return (
    <a
      title={viewModel.fullGameName ?? viewModel.gameName}
      href={viewModel.rootPlaceId ? `/games/${viewModel.rootPlaceId}` : undefined}
      // 48px box; the thumbnail container has no intrinsic size outside the legacy container.
      style={{
        position: "relative",
        display: "block",
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: 8,
        overflow: "hidden",
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <Thumbnail2d
        type={ThumbnailTypes.gameIcon}
        size={DefaultThumbnailSize}
        format={ThumbnailFormat.webp}
        targetId={viewModel.universeId}
        containerClass="notification-icon"
      />
    </a>
  );
};

// Presentational-with-actions React port of the Angular gameUpdate card. Angular resolves
// the model + owns the action logic during migration (passed as handlers); this renders
// the three states (single / aggregated / unfollowed) and triggers those handlers.
export const GameUpdateNotification = ({
  viewModel,
  handlers,
}: GameUpdateNotificationProps): JSX.Element => {
  const translate = useNotificationLocalization();
  // React-owned mark-read: unlike Angular (which never cleared game-update unread), clicking
  // anywhere on the React card clears the dot. Local state so it clears in-place on click.
  const [read, setRead] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasStatusIndicator = !viewModel.isInteracted && !read;
  const timestamp = viewModel.eventDate
    ? getRelativeTimeMaxDays(new Date(viewModel.eventDate), new Date())
    : undefined;
  // Override the navbar <li>'s inherited text-align:center (Navigation.css).
  const cardStyle: React.CSSProperties = { textAlign: "left" };

  const markReadAndGo = (): void => {
    setRead(true);
    handlers.onGoToDetails();
  };

  const restoreFocus = (): void => cardRef.current?.focus();

  if (viewModel.state === "unfollowed") {
    return (
      <Notification
        ref={cardRef}
        tabIndex={-1}
        className="game-update-card"
        style={cardStyle}
        title={undefined}
        description={translate("Message.UnfollowedGame", { gameName: viewModel.gameName })}
        hasStatusIndicator={hasStatusIndicator}
        secondaryAction={
          <Button
            className="game-update-action basis-0"
            variant="Standard"
            size="Small"
            isDisabled={handlers.isFollowPending}
            onClick={() => {
              handlers.onUndo();
              restoreFocus();
            }}
          >
            {translate("Action.Undo")}
          </Button>
        }
      />
    );
  }

  if (viewModel.state === "aggregated") {
    const openDrilldown = (): void => {
      setRead(true);
      handlers.onViewUpdates();
    };
    const { gameOne, gameTwo, otherCount } = viewModel.aggregation ?? {
      gameOne: "",
      gameTwo: "",
      otherCount: 0,
    };
    const names = [gameOne, gameTwo];
    const aggregatedText = translate(
      otherCount > 0
        ? "Message.AggregatedGameUpdateMultiple"
        : "Message.AggregatedGameUpdateDouble",
      { gameOne: AGG_TOKENS[0], gameTwo: AGG_TOKENS[1], otherCount },
    );
    const description = aggregatedText.split(AGG_TOKEN_SPLIT).map((part, index) => {
      const tokenIndex = AGG_TOKENS.indexOf(part);
      return tokenIndex >= 0 ? (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`g${index}`} className="game-update-emphasis">
          {names[tokenIndex]}
        </span>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`t${index}`}>{part}</React.Fragment>
      );
    });
    return (
      <Notification
        className="game-update-card"
        style={cardStyle}
        media={<GameUpdateThumbnail viewModel={viewModel} onClick={openDrilldown} />}
        title={undefined}
        description={description}
        trailingAction={<span className="game-update-chevron" />}
        timestamp={timestamp}
        hasStatusIndicator={hasStatusIndicator}
        onClick={openDrilldown}
      />
    );
  }

  // Single followed update. Whole-card click clears unread + goes to details; the game name
  // is plain (the card navigates). Play + kebab stopPropagation for their own actions.
  const isUnresolved = viewModel.isResolved === false;
  const canPlay = viewModel.canLaunch && viewModel.isPlayable === true;
  const showNotPlayable = viewModel.canLaunch && viewModel.isPlayable === false;
  return (
    <Notification
      ref={cardRef}
      tabIndex={-1}
      className="game-update-card"
      style={cardStyle}
      media={
        isUnresolved ? undefined : (
          <GameUpdateThumbnail viewModel={viewModel} onClick={markReadAndGo} />
        )
      }
      title={undefined}
      trailingAction={
        isUnresolved ? undefined : (
          <GameUpdateKebab
            gameName={viewModel.gameName}
            onUnfollow={() => {
              handlers.onUnfollow();
              restoreFocus();
            }}
            onReport={handlers.onReport}
            onOpenChange={handlers.onMetaActionsOpenChange}
            isUnfollowPending={handlers.isFollowPending}
          />
        )
      }
      description={
        <React.Fragment>
          <a
            className="text-name game-update-emphasis"
            href={viewModel.rootPlaceId ? `/games/${viewModel.rootPlaceId}` : undefined}
            title={viewModel.fullGameName ?? viewModel.gameName}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              markReadAndGo();
            }}
          >
            {viewModel.gameName}
          </a>
          {`: ${viewModel.updateMessage}`}
          {!viewModel.updateMessage && (
            <span
              className="game-update-spinner"
              role="progressbar"
              aria-label={translate("Label.Loading")}
            />
          )}
          {showNotPlayable && (
            <span className="text-caption-body not-playable-message" style={{ display: "block" }}>
              {translate("Message.GameNotPlayableOnDevice")}
            </span>
          )}
        </React.Fragment>
      }
      timestamp={timestamp}
      hasStatusIndicator={hasStatusIndicator}
      onClick={markReadAndGo}
      primaryAction={
        canPlay ? (
          <Button
            className="game-update-action basis-0"
            variant="Emphasis"
            size="Small"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setRead(true);
              handlers.onPlay();
            }}
          >
            {translate("Action.Play")}
          </Button>
        ) : undefined
      }
    />
  );
};

export default GameUpdateNotification;
