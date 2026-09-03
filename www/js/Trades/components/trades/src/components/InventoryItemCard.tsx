import { useTranslation } from "@rbx/core-scripts/react";
import { TradableItem } from "../types";
import TradeItemCard from "./TradeItemCard";

export type InventoryItemCardProps = {
  item: TradableItem;
  /** Already added to an offer (shows the selection check). */
  selected: boolean;
  /** Not selectable (selected, side full, or on hold). */
  unavailable: boolean;
  onClick: (item: TradableItem) => void;
};

/**
 * Selectable inventory card: wraps the shared catalog card (via TradeItemCard ->
 * react-style-guide ItemCard) and layers the selection / on-hold overlay on top.
 * Clicking anywhere on the card toggles the item in/out of the offer (the wrapped
 * card's own links are intercepted), matching inventoryController's item click.
 */
export const InventoryItemCard = ({
  item,
  selected,
  unavailable,
  onClick,
}: InventoryItemCardProps): JSX.Element => {
  const { translate } = useTranslation();

  const toggle = () => {
    onClick(item);
  };

  // Selection / on-hold overlay. Rendered inside the ItemCard thumbnail (via
  // TradeItemCard) so it lines up exactly with the thumbnail image.
  const overlay = unavailable ? (
    <div className="item-card-equipped">
      {selected && <span className="icon-check-selection" />}
      {item.isOnHold && (
        <div className="item-card-holding">
          <div className="icon-uiblox-pending" />
          <div className="item-card-holding-label font-header-2">{translate("Label.Holding")}</div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      className={`trade-inventory-card${unavailable ? " is-unavailable" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      // Only the thumbnail selects. Capture the click so it beats the card's own
      // thumbnail link, but ignore clicks on the caption (name/price) so those
      // links keep working. Keyboard (Enter/Space) still toggles the focused card.
      onClickCapture={event => {
        const target = event.target as HTMLElement;
        if (!target.closest(".item-card-thumb-container")) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
    >
      <TradeItemCard item={item} overlay={overlay} />
    </div>
  );
};

export default InventoryItemCard;
