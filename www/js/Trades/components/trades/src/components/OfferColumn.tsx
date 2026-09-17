import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslation } from "@rbx/core-scripts/react";
import { IconButton, TextInput } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from "@rbx/thumbnails";
import { DraftOffer, TradableItem } from "../types";
import {
  calculateOfferValue,
  calculateRobuxMinusFee,
  getFeeAsPercent,
  renderSerialNumber,
} from "../utils/tradesUtils";

export type OfferColumnProps = {
  offer: DraftOffer;
  onRemoveItem: (item: TradableItem) => void;
  onRobuxChange: (offerUserId: number, value: string) => void;
  onRobuxBlur: (offer: DraftOffer) => void;
  isRobuxValid: (robux: number | null) => boolean;
  doesItemHaveError: (item: TradableItem) => boolean;
  getItemErrorReason: (item: TradableItem) => string;
  /** True when this column is the partner's and they cannot send Robux. */
  robuxLocked?: boolean;
};

const buildSeoName = (name: string): string =>
  encodeURIComponent(
    name
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  );

/**
 * One editable side of the trade being built (port of tradeRequestOffer.html):
 * item slots with remove buttons, a digits-only Robux input, and the after-fee /
 * total value lines.
 */
export const OfferColumn = ({
  offer,
  onRemoveItem,
  onRobuxChange,
  onRobuxBlur,
  isRobuxValid,
  doesItemHaveError,
  getItemErrorReason,
  robuxLocked = false,
}: OfferColumnProps): JSX.Element => {
  const { translate } = useTranslation();
  const robuxValid = isRobuxValid(offer.robux);
  const hasRobux = Boolean(offer.robux && offer.robux > 0);
  // Doubles as the disabled field's placeholder, so the reason sits in the
  // control it explains rather than on a line of its own below it.
  const robuxLockMessage = translate(
    "Message.YouCanOnlyRequestRobuxFromPlusUsers",
    undefined,
    "This user needs Roblox Plus to send Robux as part of the trade",
  );

  const renderItemSlot = (item: TradableItem) => {
    const isBundle = item.itemTarget.itemType === "Bundle";
    const itemUrl = `${isBundle ? "/bundles" : "/catalog"}/${
      item.itemTarget.targetId
    }/${buildSeoName(item.itemName)}`;
    const hasError = doesItemHaveError(item);

    return (
      <div className={`trade-request-item${hasError ? " invalid-request-item" : ""}`}>
        <IconButton
          className="trade-request-item-remove"
          icon="icon-regular-x"
          ariaLabel={`${translate("Action.Remove")} ${item.itemName}`}
          variant="Utility"
          size="Small"
          isCircular
          onClick={() => {
            onRemoveItem(item);
          }}
        />
        <Thumbnail2d
          type={isBundle ? ThumbnailTypes.bundleThumbnail : ThumbnailTypes.assetThumbnail}
          targetId={item.itemTarget.targetId}
          size={DefaultThumbnailSize}
        />
        <div className="text-lead item-name" title={item.itemName}>
          <span>
            <a href={itemUrl} target="_blank" rel="noreferrer">
              {item.itemName}
            </a>
          </span>
        </div>
        {Boolean(item.recentAveragePrice) && (
          <div className="item-value">
            <span className="icon-robux-16x16" />
            <span className="text-robux">{formatNumber(item.recentAveragePrice || 0)}</span>
          </div>
        )}
        {hasError && <span className="text-error">{getItemErrorReason(item)}</span>}
      </div>
    );
  };

  return (
    <div className="trade-request-window-offer">
      <h2>{offer.label}</h2>

      {offer.slots.map((slot, index) => {
        if (slot.type === "item" && slot.tradableItem) {
          return (
            <div
              key={slot.tradableItem.id ?? index}
              title={renderSerialNumber(slot.tradableItem, translate)}
            >
              {renderItemSlot(slot.tradableItem)}
            </div>
          );
        }
        if (slot.type === "add-item") {
          // eslint-disable-next-line react/no-array-index-key
          return <div key={`add-${index}`} className="trade-request-item draggable-border" />;
        }
        // eslint-disable-next-line react/no-array-index-key
        return <div key={`empty-${index}`} className="trade-request-item blank-item" />;
      })}

      <TextInput
        className={`robux-input-group${robuxLocked ? " robux-input-group-locked" : ""}`}
        size="Medium"
        name="robux"
        type="text"
        inputMode="numeric"
        pattern="\d*"
        autoComplete="off"
        placeholder={robuxLocked ? robuxLockMessage : translate("Label.PlusRobuxAmount")}
        value={offer.robux === null ? "" : String(offer.robux)}
        isDisabled={robuxLocked}
        hasError={!robuxValid}
        leadingIconName="icon-regular-robux"
        // A placeholder is not announced once the field has a value, and it
        // truncates when the column is narrow, so the reason is repeated here.
        title={robuxLocked ? robuxLockMessage : undefined}
        aria-label={robuxLocked ? robuxLockMessage : undefined}
        onChange={event => {
          if (robuxLocked) {
            return;
          }
          onRobuxChange(offer.user.id, event.target.value);
        }}
        onBlur={() => {
          onRobuxBlur(offer);
        }}
      />

      {hasRobux && (
        <div className="robux-line">
          <span className="text-secondary">
            {translate("Label.AfterRobuxFee", { percent: `${getFeeAsPercent()}` })}
          </span>
          <span className="robux-line-amount">
            <span className="icon-robux-16x16" />
            <span className="text-secondary robux-line-value">
              {formatNumber(calculateRobuxMinusFee(offer.robux ?? 0))}
            </span>
          </span>
        </div>
      )}

      <div className="robux-line">
        <span className="text-lead">{translate("Label.TotalValue")}</span>
        <span className="robux-line-amount">
          <span className="icon-robux-16x16" />
          <span className="text-robux-lg robux-line-value">
            {formatNumber(calculateOfferValue(offer))}
          </span>
        </span>
      </div>
    </div>
  );
};

export default OfferColumn;
