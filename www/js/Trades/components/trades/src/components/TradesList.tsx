import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import tradesConstants from "../constants/tradesConstants";
import {
  expireOutdatedTrades,
  getSettings,
  getTrade,
  setTradeQuality,
} from "../services/tradesApi";
import {
  getTradeItemParameters,
  sendAXError,
  sendAXEvent,
  sendEvent,
  tradeEvents,
} from "../services/tradeEvents";
import {
  TradeDetail as TradeDetailType,
  TradeQualityType,
  TradeStatusType,
  TradeSummary,
} from "../types";
import { isMobile as detectMobile } from "../utils/tradesUtils";
import useTradesPager from "../hooks/useTradesPager";
import FilterChips, { FilterChipOption } from "./FilterChips";
import TradeRow from "./TradeRow";
import TradeDetail from "./TradeDetail";
import TradesEmptyState from "./TradesEmptyState";
import HowToTradeSheet from "./HowToTradeSheet";
import TradeQualityFilterSheet, { TradeQualityOption } from "./TradeQualityFilterSheet";

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

export type TradesListProps = {
  systemFeedbackService: SystemFeedbackService;
};

const STATUS_TABS: {
  value: TradeStatusType;
  labelKey: string;
  emptyTitleKey: string;
  emptySubtitleKey: string;
}[] = [
  {
    value: tradesConstants.tradeStatusType.inbound,
    labelKey: "Label.Received",
    // "Recieved" is the spelling of the resource key itself, not a typo here.
    emptyTitleKey: "Label.YouHaveNoTradesRecieved",
    emptySubtitleKey: "Label.AllOffersWillBeHere",
  },
  {
    value: tradesConstants.tradeStatusType.outbound,
    labelKey: "Label.Sent",
    emptyTitleKey: "Label.YouHaveNoTradesSent",
    emptySubtitleKey: "Label.AllYourRequestsWillBeHere",
  },
  {
    value: tradesConstants.tradeStatusType.completed,
    labelKey: "Label.Completed",
    emptyTitleKey: "Label.YouHaveNoCompletedTrades",
    emptySubtitleKey: "Label.AllCompletedTradesWillBeHere",
  },
  {
    value: tradesConstants.tradeStatusType.inactive,
    labelKey: "Label.Closed",
    emptyTitleKey: "Label.YouHaveNoClosedTrades",
    emptySubtitleKey: "Label.AllClosedTradesWillBeHere",
  },
];

const QUALITY_OPTIONS: { value: TradeQualityType; labelKey: string }[] = [
  { value: tradesConstants.tradeQualityType.none, labelKey: "Label.None" },
  { value: tradesConstants.tradeQualityType.low, labelKey: "Label.Low" },
  { value: tradesConstants.tradeQualityType.medium, labelKey: "Label.Medium" },
  { value: tradesConstants.tradeQualityType.high, labelKey: "Label.High" },
];

export const TradesList = ({ systemFeedbackService }: TradesListProps): JSX.Element => {
  const { translate } = useTranslation();
  const pager = useTradesPager();
  const isMobile = useMemo(() => detectMobile(), []);

  const [selectedTab, setSelectedTab] = useState<TradeStatusType>(
    tradesConstants.tradeStatusType.inbound,
  );
  const [selectedQuality, setSelectedQuality] = useState<TradeQualityType>(
    tradesConstants.tradeQualityType.none,
  );
  const [selectedTrade, setSelectedTrade] = useState<TradeDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [isQualityFilterOpen, setIsQualityFilterOpen] = useState(false);
  const [isHowToTradeOpen, setIsHowToTradeOpen] = useState(false);

  const selectedTradeIdRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const tabOptions: FilterChipOption[] = useMemo(
    () => STATUS_TABS.map(tab => ({ value: tab.value, label: translate(tab.labelKey) })),
    [translate],
  );
  const qualityOptions: TradeQualityOption[] = useMemo(
    () =>
      QUALITY_OPTIONS.map(option => ({ value: option.value, label: translate(option.labelKey) })),
    [translate],
  );

  const activeTab = STATUS_TABS.find(tab => tab.value === selectedTab) ?? STATUS_TABS[0]!;

  const selectTrade = useCallback((summary: TradeSummary | null) => {
    selectedTradeIdRef.current = summary ? summary.id : null;

    if (!summary) {
      setSelectedTrade(null);
      return;
    }

    // Show summary info immediately (offers undefined -> spinner) while the
    // full detail loads.
    setSelectedTrade({ ...summary, offers: undefined } as unknown as TradeDetailType);
    setDetailLoading(true);

    getTrade(authenticatedUser()?.id!, summary.id)
      .then(detail => {
        if (!detail || selectedTradeIdRef.current !== summary.id) {
          return;
        }
        const merged: TradeDetailType = {
          ...detail,
          id: summary.id,
          tradeStatusType: summary.tradeStatusType,
          expiration: summary.expiration,
          status: summary.status,
        };
        setSelectedTrade(merged);
        setDetailLoading(false);

        const eventParameters = {
          ...getTradeItemParameters(merged),
          tradeId: merged.id,
          tradeStatusType: merged.tradeStatusType,
        };
        sendAXEvent(tradeEvents.tradeViewed, "viewTrade", eventParameters);
      })
      .catch((error: unknown) => {
        sendAXError("viewTrade", error as Error);
        setDetailLoading(false);
      });
  }, []);

  const selectTab = useCallback(
    (tabValue: TradeStatusType) => {
      setSelectedTab(tabValue);
      setSelectedTrade(null);
      selectedTradeIdRef.current = null;

      // Soft refresh: jump back to the top of the list so the freshly queried
      // page is visible from the start (the list is a scrollable container).
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }

      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabValue);
      window.history.replaceState({}, "", url.toString());

      pager
        .loadFirstPage(tabValue)
        .then(items => {
          if (items.length > 0) {
            selectTrade(items[0]!);
          }
        })
        .catch((error: unknown) => {
          sendAXError("loadTradesList", error as Error, { tab: tabValue });
          systemFeedbackService.warning(translate("Error.FailedToLoadTradesList"));
        });
    },
    [pager, selectTrade, systemFeedbackService, translate],
  );

  // Init: mirrors tradesListController.init.
  useEffect(() => {
    expireOutdatedTrades().catch(() => undefined);

    getSettings()
      .then(settings => {
        if (settings?.tradeQualityFilter) {
          setSelectedQuality(settings.tradeQualityFilter);
        }
      })
      .catch(() => undefined);

    const tabParam = new URLSearchParams(window.location.search).get("tab");
    const initialTab =
      STATUS_TABS.find(tab => tab.value === tabParam)?.value ?? STATUS_TABS[0]!.value;
    selectTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    pager.loadNextPage().catch((error: unknown) => {
      sendAXError("loadTradesList", error as Error, { paged: true });
      systemFeedbackService.warning(translate("Error.FailedToLoadTradesList"));
    });
  }, [pager, systemFeedbackService, translate]);

  const onScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element || pager.loading || !pager.hasMore) {
      return;
    }
    const nearBottom =
      element.scrollTop + element.offsetHeight >=
      element.scrollHeight - tradesConstants.tradesList.scrollBarLazyLoadDistancePx;

    if (nearBottom) {
      loadMore();
    }
  }, [loadMore, pager.loading, pager.hasMore]);

  // Keep loading pages until the list is long enough to actually scroll (or the
  // API runs out of pages). Without this the first page may not fill the
  // fixed-height scroll container, so `onScroll` would never fire and infinite
  // scroll would stall after page one.
  useEffect(() => {
    const element = scrollRef.current;
    // Bail if a load is in flight, there's nothing more, or the last load
    // failed — otherwise a failing request on a non-scrollable list would retry
    // endlessly (loading flips back to false, re-triggering this effect).
    if (!element || pager.loading || !pager.hasMore || pager.loadFailed) {
      return;
    }
    const notScrollableYet =
      element.scrollHeight <=
      element.clientHeight + tradesConstants.tradesList.scrollBarLazyLoadDistancePx;
    if (notScrollableYet) {
      loadMore();
    }
  }, [pager.trades, pager.loading, pager.hasMore, pager.loadFailed, loadMore]);

  const onTradeClick = (trade: TradeSummary) => {
    selectTrade(trade);
    setMobileView("detail");
    sendEvent(tradeEvents.tradesList, "viewTrade");
  };

  const onProfileClick = (
    trade: { tradeStatusType?: TradeStatusType; user: { id: number } | null; id: number },
    source: string,
  ) => {
    sendAXEvent(tradeEvents.profileClick, source, {
      tradeStatusType: trade.tradeStatusType || selectedTab,
      partnerId: trade.user?.id,
      tradeId: trade.id,
    });
  };

  const onTabClick = (tabValue: string) => {
    const value = tabValue as TradeStatusType;
    // Pressing the chip of the tab already shown reloads it instead of switching.
    // Ignored while a load is running, since `loadFirstPage` has no in-flight
    // guard of its own and repeated presses would otherwise stack up overlapping
    // requests. A genuine switch still goes through, as there the newer choice
    // should win.
    const isRefresh = value === selectedTab;
    if (isRefresh && pager.loading) {
      return;
    }

    const context = isRefresh ? "refreshTradeCategory" : "switchTradeCategory";
    sendEvent(tradeEvents.tradesList, context, { category: value });
    sendAXEvent(tradeEvents.filterClick, context, {
      filterType: "statusTab",
      value,
    });
    selectTab(value);
  };

  const onQualityClick = (qualityValue: string) => {
    const value = qualityValue as TradeQualityType;
    setSelectedQuality(value);
    setTradeQuality(value).catch(() => undefined);
    sendAXEvent(tradeEvents.filterClick, "tradeQuality", { filterType: "tradeQuality", value });
  };

  const onHowToTradeOpen = () => {
    setIsHowToTradeOpen(true);
    sendEvent(tradeEvents.tradesList, "tradeInfo");
  };

  // Fired for the support article the explainer links out to, not for opening
  // the explainer itself.
  const onHowToTradeLearnMore = () => {
    sendAXEvent(tradeEvents.howToTradeClick, "howToTrade");
  };

  const onShopClick = () => {
    sendEvent(tradeEvents.tradesList, "shopLimiteds");
  };

  const onQualityFilterOpen = () => {
    setIsQualityFilterOpen(true);
    sendEvent(tradeEvents.tradesList, "tradeQualityFilter");
  };

  const onTradeRemoved = (tradeId: number) => {
    const wasSelected = selectedTrade?.id === tradeId;
    const remaining = pager.trades.filter(trade => trade.id !== tradeId);
    pager.removeTrade(tradeId);

    if (wasSelected) {
      if (remaining.length > 0) {
        selectTrade(remaining[0]!);
      } else {
        selectTrade(null);
        setMobileView("list");
      }
    }
    onScroll();
  };

  const showListPane = !isMobile || mobileView === "list";
  const showDetailPane = !isMobile || mobileView === "detail";

  return (
    <div className={`trades-react${isMobile ? " is-mobile" : ""}`}>
      {showListPane && (
        <div className="col-xs-12 col-sm-4 trade-row-list">
          <div className="trades-header">
            <h1>{translate("Heading.TradesList")}</h1>
            <div className="trades-header-actions">
              <IconButton
                onClick={onHowToTradeOpen}
                icon="icon-regular-circle-i"
                ariaLabel={translate("Header.HowToTrade")}
                variant="Utility"
                size="Medium"
              />
              <IconButton
                onClick={onQualityFilterOpen}
                icon="icon-regular-gear"
                ariaLabel={translate("Header.TradeQualityFilter")}
                variant="Utility"
                size="Medium"
              />
            </div>
          </div>

          <FilterChips options={tabOptions} value={selectedTab} onSelect={onTabClick} />

          <div id="trade-row-scroll-container" ref={scrollRef} onScroll={onScroll}>
            {pager.trades.map(trade => (
              <TradeRow
                key={trade.id}
                trade={trade}
                isSelected={selectedTrade?.id === trade.id}
                onClick={onTradeClick}
                onProfileClick={onProfileClick}
              />
            ))}
            {pager.loading && <span className="spinner spinner-default" />}
            {pager.noResults && !pager.loading && (
              <TradesEmptyState
                title={translate(activeTab.emptyTitleKey)}
                subtitle={translate(activeTab.emptySubtitleKey)}
                action={{
                  label: translate("Action.LearnMore"),
                  onClick: onHowToTradeOpen,
                }}
              />
            )}
          </div>
        </div>
      )}

      {showDetailPane && (
        <div className="col-xs-12 col-sm-8 trades-list-detail">
          <TradeDetail
            trade={selectedTrade}
            detailLoading={detailLoading}
            isMobile={isMobile}
            onBack={() => {
              setMobileView("list");
            }}
            onProfileClick={onProfileClick}
            onTradeRemoved={onTradeRemoved}
            systemFeedbackService={systemFeedbackService}
          />
        </div>
      )}

      <HowToTradeSheet
        isOpen={isHowToTradeOpen}
        onOpenChange={setIsHowToTradeOpen}
        onShopClick={onShopClick}
        onLearnMoreClick={onHowToTradeLearnMore}
      />

      <TradeQualityFilterSheet
        isOpen={isQualityFilterOpen}
        onOpenChange={setIsQualityFilterOpen}
        options={qualityOptions}
        value={selectedQuality}
        onSelect={onQualityClick}
      />
    </div>
  );
};

export default TradesList;
