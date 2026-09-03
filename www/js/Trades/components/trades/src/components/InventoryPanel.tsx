import { useMemo, useState } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import tradesConstants from "../constants/tradesConstants";
import useInventoryPager from "../hooks/useInventoryPager";
import { sendAXEvent, sendEvent, tradeEvents } from "../services/tradeEvents";
import { TradableItem, TradeUser } from "../types";
import FilterDropdown, { DropdownOption } from "./FilterDropdown";
import InventoryItemCard from "./InventoryItemCard";
import InventorySearch from "./InventorySearch";
import TradesEmptyState from "./TradesEmptyState";

export type InventoryPanelProps = {
  user: TradeUser;
  onItemClick: (item: TradableItem) => void;
  isItemInOffers: (item: TradableItem) => boolean;
  isItemUnavailable: (item: TradableItem) => boolean;
};

/**
 * A user's tradable-item inventory with a category filter and cursor pagination
 * (port of inventoryController + inventoryPanel.html). Drives useInventoryPager.
 */
export const InventoryPanel = ({
  user,
  onItemClick,
  isItemInOffers,
  isItemUnavailable,
}: InventoryPanelProps): JSX.Element => {
  const { translate } = useTranslation();
  const pager = useInventoryPager(user.id);
  const isMe = user.id === authenticatedUser()?.id;
  // The search takes over the filter row when open, so the row owns the state.
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filterOptions: DropdownOption[] = useMemo(
    () =>
      tradesConstants.inventoryFilters.map(filter => ({
        value: filter.value,
        label: translate(filter.labelKey),
      })),
    [translate],
  );

  const inventoryLabel = isMe
    ? translate("Label.YourInventory")
    : translate("Label.TheirInventory", { username: user.displayName });

  const onFilterSelect = (value: string) => {
    pager.setFilter(value);
    sendEvent(tradeEvents.tradeRequest, "switchAccessoryType", { type: value || null });
    sendAXEvent(tradeEvents.filterClick, "switchAccessoryType", {
      filterType: "inventoryCategory",
      value: value || null,
    });
  };

  const onNext = () => {
    sendEvent(tradeEvents.tradeRequest, "inventoryPage");
    pager.loadNext();
  };

  // Temporarily hidden: Shop CTA on an empty own inventory while starting a
  // trade. Restore `onShopClick` and the `action` on the empty state below.
  // const onShopClick = () => {
  //   sendEvent(tradeEvents.tradeRequest, "shopLimiteds");
  // };

  const isEmpty = !pager.loading && !pager.loadFailed && pager.items.length === 0;

  // Which "nothing here" message fits, from the most specific reason the list is
  // empty to the least: a search that matched nothing, then a category holding
  // nothing, and only a genuinely empty inventory gets the shopping prompt.
  const renderEmptyState = () => {
    if (pager.appliedSearch !== "") {
      return (
        <div className="col-xs-12 container-empty">
          {translate("Label.NoResultsFound", undefined, "No results found")}
        </div>
      );
    }

    // Covers a filtered and an unfiltered inventory alike, since the message is
    // already category-scoped. There is no shopping prompt for someone else's
    // inventory either way — nothing there for the viewer to act on.
    if (!isMe) {
      return (
        <div className="col-xs-12 container-empty">{translate("Label.TheirInventoryEmpty")}</div>
      );
    }

    if (pager.filter !== "") {
      return (
        <div className="col-xs-12 container-empty">{translate("Label.YourInventoryEmpty")}</div>
      );
    }

    return (
      <TradesEmptyState
        className="trade-inventory-empty-state"
        title={translate("Label.YouHaveNoRobloxLimiteds")}
        subtitle={translate("Label.ShopForMoreToStartTrading")}
        // Temporarily hidden while starting a trade with no Limiteds.
        // action={{
        //   label: translate("Action.Shop"),
        //   href: tradesConstants.urls.limitedsCatalog,
        //   onClick: onShopClick,
        //   variant: "Emphasis",
        // }}
      />
    );
  };

  return (
    <div className="col-xs-12 trade-inventory-panel">
      <div className="row inventory-panel-header">
        <h2 className="inventory-label paired-name">{inventoryLabel}</h2>
      </div>

      <div className="inventory-filter-row">
        <FilterDropdown
          options={filterOptions}
          value={pager.filter}
          onSelect={onFilterSelect}
          ariaLabel={translate("Label.Category")}
        />
        <InventorySearch
          isOpen={isSearchOpen}
          value={pager.search}
          onChange={pager.setSearch}
          onOpen={() => {
            setIsSearchOpen(true);
          }}
          onClose={() => {
            setIsSearchOpen(false);
          }}
        />
      </div>

      <div>
        <ul className="hlist item-cards item-cards-stackable">
          {pager.items.map(item => (
            <li key={item.id} className="list-item item-card trade-item-card">
              <InventoryItemCard
                item={item}
                selected={isItemInOffers(item)}
                unavailable={isItemUnavailable(item)}
                onClick={onItemClick}
              />
            </li>
          ))}
        </ul>

        {pager.loading && <span className="spinner spinner-default" />}

        {!pager.loading && pager.loadFailed && (
          <div className="col-xs-12 container-empty">{translate("Error.TradeUnknownError")}</div>
        )}

        {isEmpty && renderEmptyState()}

        {(pager.hasPrev || pager.hasNext) && (
          <div className="trade-inventory-pager">
            <button
              type="button"
              className="btn-generic-left-sm"
              disabled={!pager.hasPrev || pager.loading}
              aria-label={translate("Action.Back")}
              onClick={pager.loadPrev}
            >
              <span className="icon-left" />
            </button>
            <span className="trade-inventory-pager-label">
              {translate("Label.CurrentPage", { currentPage: pager.page })}
            </span>
            <button
              type="button"
              className="btn-generic-right-sm"
              disabled={!pager.hasNext || pager.loading}
              aria-label={translate("Action.Next")}
              onClick={onNext}
            >
              <span className="icon-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
