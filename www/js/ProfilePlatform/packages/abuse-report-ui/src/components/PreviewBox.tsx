import React from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailGameIconSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import type { ReviewNode } from "../hooks/abuseSheetFlow/types";
import { useArTranslation } from "../util/translate/arTranslation";

type Preview = NonNullable<ReviewNode["preview"]>;

const UserPreview = ({
  preview,
}: {
  preview: Extract<Preview, { type: "user" }>;
}): React.ReactElement => (
  <div className="flex items-center gap-medium padding-medium bg-action-standard radius-medium">
    <div className="flex-shrink-0">
      <Thumbnail2d
        type={ThumbnailTypes.avatarHeadshot}
        size={ThumbnailAvatarHeadshotSize.size48}
        targetId={Number(preview.id)}
        format={ThumbnailFormat.webp}
        containerClass="avatar avatar-headshot-sm"
      />
    </div>
    <div className="flex flex-col min-w-0">
      {preview.displayName && (
        <span className="text-body-medium font-bold truncate">{preview.displayName}</span>
      )}
      {preview.username && (
        // eslint-disable-next-line react/jsx-no-literals
        <span className="text-body-small content-secondary truncate">@{preview.username}</span>
      )}
    </div>
  </div>
);

const ChatPreview = ({
  preview,
}: {
  preview: Extract<Preview, { type: "chat" }>;
}): React.ReactElement => {
  const { translate } = useArTranslation();
  return (
    <div className="padding-medium bg-action-standard radius-medium">
      <span className="text-body-small">{translate(preview.text)}</span>
    </div>
  );
};

const ExperiencePreview = ({
  preview,
}: {
  preview: Extract<Preview, { type: "experience" }>;
}): React.ReactElement => (
  <div className="flex items-center gap-medium padding-medium bg-action-standard radius-medium">
    <div className="flex-shrink-0">
      <Thumbnail2d
        type={ThumbnailTypes.gameIcon}
        size={ThumbnailGameIconSize.size150}
        targetId={Number(preview.id)}
        format={ThumbnailFormat.webp}
        containerClass="game-icon game-icon-sm"
      />
    </div>
    <div className="flex flex-col min-w-0">
      {preview.title && (
        <span className="text-body-medium font-bold truncate">{preview.title}</span>
      )}
    </div>
  </div>
);

/**
 * Renders a visual preview of a thing. Dispatches to a type-specific layout (user, chat, experience, etc).
 */
const PreviewBox = ({ preview }: { preview: Preview }): React.ReactElement => {
  switch (preview.type) {
    case "user":
      return <UserPreview preview={preview} />;
    case "chat":
      return <ChatPreview preview={preview} />;
    case "experience":
      return <ExperiencePreview preview={preview} />;
    default: {
      const exhaustiveCheck: never = preview;
      throw new Error(`Unknown preview type: ${(exhaustiveCheck as Preview).type}`);
    }
  }
};

export default PreviewBox;
