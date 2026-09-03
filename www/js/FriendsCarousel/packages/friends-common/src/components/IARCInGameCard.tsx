import { Fragment, JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Button as FoundationButton, Link as FoundationLink } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from "@rbx/thumbnails";

const IARCInGameCard = ({
  displayName,
  userPresence,
  universeId,
  userProfileUrl,
  canChat,
  translate,
  launchGame,
  gameUrl,
  placeId,
  isIARCJoinCardGameRowClickableEnabled,
  sendGameRowClickEvent,
  startChat,
}: {
  displayName: string;
  userPresence: string;
  universeId: number;
  userProfileUrl: string;
  canChat: boolean;
  translate: TranslateFunction;
  launchGame: () => Promise<void>;
  gameUrl: string;
  placeId: number | null;
  isIARCJoinCardGameRowClickableEnabled: boolean;
  sendGameRowClickEvent: () => void;
  startChat: () => void;
}): JSX.Element => {
  const rowContent = (
    <Fragment>
      <span
        className="shrink-0 radius-small clip"
        style={{ display: "inline-block", width: 40, height: 40 }}
      >
        <Thumbnail2d
          type={ThumbnailTypes.gameIcon}
          size={ThumbnailGameIconSize.size150}
          targetId={universeId}
          imgClassName="width-full height-full"
          containerClass="width-full height-full"
        />
      </span>
      <span className="friend-presence-info flex flex-col justify-center min-width-0 fill">
        <span className="friend-tile-is-playing text-body-medium content-default text-truncate-end text-no-wrap">
          {displayName} {translate("Text.IsPlaying")}
        </span>
        <span className="friend-tile-game-name text-title-medium content-emphasis text-truncate-end text-no-wrap">
          {userPresence}
        </span>
      </span>
    </Fragment>
  );

  const isRowClickable = isIARCJoinCardGameRowClickableEnabled && placeId != null && gameUrl !== "";

  return (
    <div
      className="friend-tile-dropdown friend-tile-dropdown--iarc"
      style={{ backgroundColor: "transparent", borderRadius: 0 }}
    >
      <div
        className="in-game-friend-card--iarc flex flex-col items-start justify-center padding-y-large padding-x-large gap-medium radius-medium stroke-standard stroke-default bg-over-media-300 width-full"
        style={{ boxSizing: "border-box" }}
      >
        {isRowClickable ? (
          <a
            href={gameUrl}
            onClick={sendGameRowClickEvent}
            className="flex items-center gap-small width-full min-width-0"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {rowContent}
          </a>
        ) : (
          <div className="flex items-center gap-small width-full min-width-0">{rowContent}</div>
        )}
        <div className="in-game-friend-card-actions flex flex-col self-stretch gap-small">
          <FoundationButton
            variant="Emphasis"
            size="Medium"
            className="grow"
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={launchGame}
          >
            {translate("Action.Join")}
          </FoundationButton>
          {canChat && (
            <FoundationButton variant="Standard" size="Medium" className="grow" onClick={startChat}>
              {translate("Action.Chat")}
            </FoundationButton>
          )}
          <FoundationLink
            href={userProfileUrl}
            color="Standard"
            underline="none"
            className="flex items-center justify-center self-stretch height-600 text-label-medium content-action-standard"
          >
            {translate("Label.ViewProfile")}
          </FoundationLink>
        </div>
      </div>
    </div>
  );
};

export default IARCInGameCard;
