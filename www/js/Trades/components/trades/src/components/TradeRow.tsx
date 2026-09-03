import { useTranslation } from "@rbx/core-scripts/react";
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";
import { TradeSummary } from "../types";
import { getTradeStatusLabel } from "../utils/tradeLabels";
import { localizeDate } from "../utils/tradesUtils";

export type TradeRowProps = {
  trade: TradeSummary;
  isSelected: boolean;
  onClick: (trade: TradeSummary) => void;
  onProfileClick: (trade: TradeSummary, source: string) => void;
};

/** A single row in the left-hand trades list. */
export const TradeRow = ({
  trade,
  isSelected,
  onClick,
  onProfileClick,
}: TradeRowProps): JSX.Element => {
  const { translate } = useTranslation();
  // Partner can be null for deleted/moderated accounts; render a placeholder
  // instead of dereferencing a null user (the Angular view tolerated this).
  const { user } = trade;

  return (
    <div
      className={`trade-row${isSelected ? " selected" : ""}`}
      onClick={() => {
        onClick(trade);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          onClick(trade);
        }
      }}
    >
      <div className="rbx-divider" />
      <div className="trade-row-container">
        <div className="trade-row-details">
          <div>
            <div className="avatar avatar-headshot avatar-headshot-sm">
              {user ? (
                <a
                  href={`/users/${user.id}/profile`}
                  target="_self"
                  className="avatar-card-link"
                  onClick={event => {
                    event.stopPropagation();
                    onProfileClick(trade, "listRow");
                  }}
                >
                  <Thumbnail2d
                    type={ThumbnailTypes.avatarHeadshot}
                    targetId={user.id}
                    size={ThumbnailAvatarHeadshotSize.size60}
                    containerClass="avatar-card-image"
                  />
                </a>
              ) : (
                <span className="avatar-card-image" />
              )}
            </div>
            <div className="text-lead">{user?.nameForDisplay ?? ""}</div>
            <div className="text-date-hint">{getTradeStatusLabel(trade.status, translate)}</div>
            <span className="font-caption-body text-date-hint text trade-sent-date">
              {localizeDate(trade.created)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeRow;
