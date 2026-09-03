import React, { ReactNode } from "react";
import { PrivateMessageNotificationData } from "./types";

type TranslateFunction = (resourceId: string, params?: Record<string, unknown>) => string;

// Sentinel for the bold {username}/{numberOfMessagesText} placeholder so the translated
// string can be split and the bold span swapped in (Angular pre-renders it via ng-bind-html).
const BOLD_TOKEN = "%%B%%";
const TOKEN_SPLIT = new RegExp(`(${BOLD_TOKEN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`);

// Splits `text` on the sentinel and swaps the sentinel for `boldContent` in a bold span.
const withBold = (text: string, boldContent: ReactNode): ReactNode =>
  text.split(TOKEN_SPLIT).map((part, i) =>
    part === BOLD_TOKEN ? (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`b${i}`} className="font-caption-header">
        {boldContent}
      </span>
    ) : (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={`t${i}`}>{part}</React.Fragment>
    ),
  );

// Mirrors privateMessageDirective: isStacked when eventCount > 1 or metadata is empty.
// Stacked = "You received {N} messages"; single = "Message from {name}:" + preview.
// Unread applies content-emphasis to the header (matching the Angular text-emphasis);
// the preview is always secondary.
export const buildPrivateMessageDescription = (
  translate: TranslateFunction,
  data: PrivateMessageNotificationData,
): ReactNode => {
  const metadata = data.metadataCollection ?? [];
  const count = data.eventCount ?? metadata.length;
  const isStacked = count > 1 || metadata.length === 0;
  const isUnread = !data.isInteracted;
  const headerClass = isUnread ? "content-emphasis" : "content-default";

  if (isStacked) {
    const text = translate("Message.YouReceivedMessages", {
      numberOfMessagesText: BOLD_TOKEN,
      numberOfMessages: count,
    });
    return <span className={headerClass}>{withBold(text, count)}</span>;
  }

  const author = metadata[0]!;
  const messageFrom = translate("Message.MessageFrom", { username: BOLD_TOKEN });
  return (
    <React.Fragment>
      <span className={headerClass}>{withBold(messageFrom, author.AuthorDisplayName)}</span>{" "}
      <span className="content-muted">{author.BodyPreview}</span>
    </React.Fragment>
  );
};
