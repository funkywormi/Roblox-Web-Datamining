import React from "react";
import { Button, IconButton } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { useTranslation } from "@rbx/core-scripts/react";
import urlConstants from "../../../../js/serverList/constants/urlConstants";
import serverListConstants from "../../../../js/serverList/constants/serverListConstants";
import type { TButtonVariant as ButtonVariant } from "@rbx/foundation-ui";

const { resources } = serverListConstants;

type PlayerThumbnail = {
  targetId: number | null;
  token?: string;
  type?: string;
};

type ServerListItemProps = {
  name: string;
  playerCountStatus: string;
  thumbnailTargetId: number | null;
  thumbnailToken?: string;
  thumbnailType?: string;
  secondPlayer?: PlayerThumbnail;
  onJoinClick: () => void;
  isJoinDisabled?: boolean;
  vipServerId?: number;
  universeId?: number;
  isOwner?: boolean;
  showEditIcon?: boolean;
  joinLabel: string;
  buttonVariant?: ButtonVariant;
  isWebview?: boolean;
};

const AvatarThumbnail = ({ targetId, token, type }: PlayerThumbnail) => {
  if (targetId != null) {
    return (
      <Thumbnail2d
        type={type ?? ThumbnailTypes.gameIcon}
        targetId={targetId}
        containerClass="radius-circle clip"
        imgClassName="size-full"
        includeProfileFrame={type === ThumbnailTypes.avatarHeadshot}
      />
    );
  }
  if (token) {
    return (
      <Thumbnail2d
        type={ThumbnailTypes.avatarHeadshot}
        targetId={0}
        token={token}
        containerClass="radius-circle clip"
        imgClassName="size-full"
        includeProfileFrame
      />
    );
  }
  return <div className="size-full radius-circle bg-shift-200" />;
};

const ServerListItem = ({
  name,
  playerCountStatus,
  thumbnailTargetId,
  thumbnailToken,
  thumbnailType,
  secondPlayer,
  onJoinClick,
  isJoinDisabled = false,
  vipServerId,
  universeId,
  isOwner = false,
  showEditIcon = false,
  joinLabel,
  buttonVariant = "Emphasis",
  isWebview = false,
}: ServerListItemProps) => {
  const { translate } = useTranslation();
  const editUrl =
    vipServerId != null
      ? urlConstants.getPrivateServerConfigUrl(vipServerId, isWebview ? universeId : undefined)
      : undefined;

  return (
    <div className="flex items-center justify-between padding-y-medium width-full">
      <div className="flex items-center gap-medium min-width-0">
        <div
          className={`grow-0 shrink-0 basis-auto relative height-[40px] ${secondPlayer ? "width-[60px]" : "width-[40px]"}`}
        >
          {secondPlayer && (
            <div className="absolute top-0 left-[20px] width-[40px] height-[40px]">
              <AvatarThumbnail {...secondPlayer} />
            </div>
          )}
          <div className={`width-[40px] height-[40px] ${secondPlayer ? "relative" : ""}`}>
            <AvatarThumbnail
              targetId={thumbnailTargetId}
              token={thumbnailToken}
              type={thumbnailType}
            />
          </div>
        </div>
        <div className="flex flex-col min-width-0">
          <span className="text-title-medium content-emphasis text-truncate-end">{name}</span>
          <span className="text-body-medium content-muted">{playerCountStatus}</span>
        </div>
      </div>

      <div className="flex items-center gap-small grow-0 shrink-0 basis-auto">
        {showEditIcon && isOwner && editUrl && (
          <IconButton
            as="a"
            href={editUrl}
            ariaLabel={translate(resources.configureServerText)}
            icon="icon-filled-pencil"
            size="Small"
            variant="Standard"
          />
        )}
        <div className="[min-width:63px] large:width-[200px]">
          <Button
            variant={buttonVariant}
            size="Small"
            className="width-full"
            onClick={onJoinClick}
            isDisabled={isJoinDisabled}
          >
            {joinLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerListItem;
