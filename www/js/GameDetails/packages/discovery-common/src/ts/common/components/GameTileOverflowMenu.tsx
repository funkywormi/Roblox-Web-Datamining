import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TranslateFunction, queryClient } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  Icon,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Menu,
  MenuSection,
  MenuItem,
} from "@rbx/foundation-ui";
import { FeatureGameDetails, FeaturePlacesList } from "../constants/translationConstants";
import { userSignal, gameTile } from "../constants/configConstants";
import { GameTileOverflowMenuActionType } from "../constants/eventStreamConstants";
import { getAbuseReportRevampUrl } from "../constants/abuseReportConstants";
import { PageContext } from "../types/pageContext";
import useSendNotInterestedUserSignalCallback from "./useSendNotInterestedUserSignalCallback";
import { GameTileOverflowMenuItems } from "../types/gameTileOverflowMenuItems";
import WhyThisAdModal from "./WhyThisAdModal";

type TGameTileOverflowMenuItem = {
  iconName?: React.ComponentProps<typeof Icon>["name"];
  value: GameTileOverflowMenuItems;
  title: string;
  onSelect: () => void;
};

export type TGameTileOverflowMenuEligibility = {
  enableExplicitFeedback?: boolean;
  setIsHidden?: (isHidden: boolean) => void;
  enableSponsoredFeedback?: boolean;
  isSponsored?: boolean;
  enableReportAd?: boolean;
  encryptedAdTrackingData?: string;
  enableRemoveFromFavorites?: boolean;
  onRemoveFromFavorites?: () => void;
};

export const getGameTileOverflowMenuItemsToShow = ({
  enableExplicitFeedback,
  setIsHidden,
  enableSponsoredFeedback,
  isSponsored,
  enableReportAd,
  encryptedAdTrackingData,
  enableRemoveFromFavorites,
  onRemoveFromFavorites,
}: TGameTileOverflowMenuEligibility): GameTileOverflowMenuItems[] => {
  const items: GameTileOverflowMenuItems[] = [];
  if (enableExplicitFeedback && (!isSponsored || enableSponsoredFeedback) && setIsHidden) {
    items.push(GameTileOverflowMenuItems.NotInterested);
  }
  if (enableSponsoredFeedback && isSponsored) {
    items.push(GameTileOverflowMenuItems.WhyThisAd);
  }
  if (enableReportAd && isSponsored && encryptedAdTrackingData) {
    items.push(GameTileOverflowMenuItems.ReportAd);
  }
  if (enableRemoveFromFavorites && onRemoveFromFavorites) {
    items.push(GameTileOverflowMenuItems.RemoveFromFavorites);
  }
  return items;
};

type TGameTileOverflowMenuProps = {
  open: boolean;
  menuItemsToShow: GameTileOverflowMenuItems[];
  closeMenu: (
    availableMenuItems: GameTileOverflowMenuItems[],
    menuItem?: GameTileOverflowMenuItems,
  ) => void;
  toggleMenu: (
    availableMenuItems: GameTileOverflowMenuItems[],
    menuItem?: GameTileOverflowMenuItems,
  ) => void;
  sendActionEvent: (
    actionType: GameTileOverflowMenuActionType,
    availableMenuItems: GameTileOverflowMenuItems[],
    menuItem?: GameTileOverflowMenuItems,
  ) => void;
  universeId: number;
  topicId?: string;
  page?: PageContext;
  enableExplicitFeedback?: boolean;
  setIsHidden?: (isHidden: boolean) => void;
  toggleIsHidden?: () => void;
  enableSponsoredFeedback?: boolean;
  isSponsored?: boolean;
  payerName?: string;
  sponsoredUserCohort?: string;
  enableReportAd?: boolean;
  encryptedAdTrackingData?: string;
  adCreativeAssetId?: string;
  onRemoveFromFavorites?: () => void;
  translate: TranslateFunction;
};

const GameTileOverflowMenu = ({
  open,
  menuItemsToShow,
  closeMenu,
  toggleMenu,
  sendActionEvent,
  universeId,
  topicId,
  page,
  enableExplicitFeedback,
  setIsHidden,
  toggleIsHidden,
  enableSponsoredFeedback,
  isSponsored,
  payerName,
  sponsoredUserCohort,
  enableReportAd,
  encryptedAdTrackingData,
  adCreativeAssetId,
  onRemoveFromFavorites,
  translate,
}: TGameTileOverflowMenuProps): JSX.Element | null => {
  const [isWhyThisAdModalOpen, setIsWhyThisAdModalOpen] = useState(false);
  const hasFiredExplicitFeedbackDisabledDueToMissingSetterEvent = useRef(false);
  const hasFiredReportAdDisabledDueToMissingEncryptedAdTrackingDataEvent = useRef(false);

  useEffect(() => {
    if (
      !hasFiredExplicitFeedbackDisabledDueToMissingSetterEvent.current &&
      enableExplicitFeedback &&
      (!isSponsored || enableSponsoredFeedback) &&
      !setIsHidden
    ) {
      window.EventTracker?.fireEvent(userSignal.ExplicitFeedbackDisabledDueToMissingSetter);
      hasFiredExplicitFeedbackDisabledDueToMissingSetterEvent.current = true;
    }
  }, [enableExplicitFeedback, enableSponsoredFeedback, isSponsored, setIsHidden]);

  useEffect(() => {
    if (
      !hasFiredReportAdDisabledDueToMissingEncryptedAdTrackingDataEvent.current &&
      enableReportAd &&
      isSponsored &&
      !encryptedAdTrackingData
    ) {
      window.EventTracker?.fireEvent(gameTile.ReportAdDisabledDueToMissingEncryptedAdTrackingData);
      hasFiredReportAdDisabledDueToMissingEncryptedAdTrackingDataEvent.current = true;
    }
  }, [enableReportAd, isSponsored, encryptedAdTrackingData]);

  const sendNotInterestedUserSignal = useSendNotInterestedUserSignalCallback(
    universeId,
    translate,
    page,
    topicId,
    isSponsored,
    toggleIsHidden,
  );

  const redirectToReportAd = useCallback(() => {
    if (encryptedAdTrackingData) {
      const url = getAbuseReportRevampUrl({
        abuseVector: "ad_v2",
        submitterId: authenticatedUser()?.id?.toString()!,
        targetId: encryptedAdTrackingData,
        universeId: universeId.toString(),
        adCreativeAssetId,
      });
      window.location.assign(url);
    }
  }, [encryptedAdTrackingData, universeId, adCreativeAssetId]);

  const menuItems = useMemo(() => {
    const items: TGameTileOverflowMenuItem[] = [];
    menuItemsToShow.forEach(itemToShow => {
      switch (itemToShow) {
        case GameTileOverflowMenuItems.NotInterested:
          items.push({
            iconName: "icon-filled-circle-slash",
            value: GameTileOverflowMenuItems.NotInterested,
            title: translate(FeatureGameDetails.ActionNotInterested),
            onSelect: () => {
              setIsHidden?.(true);
              sendNotInterestedUserSignal(true);
              sendActionEvent(
                GameTileOverflowMenuActionType.GameTileOverflowMenuItemActivated,
                menuItemsToShow,
                GameTileOverflowMenuItems.NotInterested,
              );
              closeMenu(menuItemsToShow);
            },
          });
          break;
        case GameTileOverflowMenuItems.WhyThisAd:
          items.push({
            iconName: "icon-regular-circle-i",
            value: GameTileOverflowMenuItems.WhyThisAd,
            title: translate(FeatureGameDetails.ActionWhyThisAd),
            onSelect: () => {
              setIsWhyThisAdModalOpen(true);
              sendActionEvent(
                GameTileOverflowMenuActionType.GameTileOverflowMenuItemActivated,
                menuItemsToShow,
                GameTileOverflowMenuItems.WhyThisAd,
              );
              closeMenu(menuItemsToShow);
            },
          });
          break;
        case GameTileOverflowMenuItems.ReportAd:
          items.push({
            iconName: "icon-regular-flag",
            value: GameTileOverflowMenuItems.ReportAd,
            title: translate(FeatureGameDetails.ActionReportAd),
            onSelect: () => {
              redirectToReportAd();
              sendActionEvent(
                GameTileOverflowMenuActionType.GameTileOverflowMenuItemActivated,
                menuItemsToShow,
                GameTileOverflowMenuItems.ReportAd,
              );
              closeMenu(menuItemsToShow);
            },
          });
          break;
        case GameTileOverflowMenuItems.RemoveFromFavorites:
          items.push({
            value: GameTileOverflowMenuItems.RemoveFromFavorites,
            title: translate(
              FeatureGameDetails.ActionRemoveFromFavorites,
              undefined,
              "Remove from Favorites",
            ),
            onSelect: () => {
              onRemoveFromFavorites?.();
              sendActionEvent(
                GameTileOverflowMenuActionType.GameTileOverflowMenuItemActivated,
                menuItemsToShow,
                GameTileOverflowMenuItems.RemoveFromFavorites,
              );
              closeMenu(menuItemsToShow);
            },
          });
          break;
        default:
          window.EventTracker?.fireEvent(gameTile.UnsupportedMenuItemCounterEvent);
          break;
      }
    });
    return items;
  }, [
    translate,
    sendActionEvent,
    menuItemsToShow,
    setIsHidden,
    sendNotInterestedUserSignal,
    closeMenu,
    redirectToReportAd,
    onRemoveFromFavorites,
  ]);

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div data-testid="game-tile-overflow-button" className="game-tile-overflow-button">
      <Popover open={open} onOpenChange={() => toggleMenu(menuItemsToShow)}>
        <PopoverTrigger asChild>
          <IconButton
            icon="icon-filled-three-dots-horizontal"
            ariaLabel={translate(FeaturePlacesList.ActionOpenTileMenu)}
            size="Small"
            variant="OverMedia"
            isCircular
            onClick={(e: React.MouseEvent<Element>) => {
              // need to prevent default because when the overflow menu is on a tile, clicking it will activate the link and navigate to the game page
              // preventing default also prevents the icon button from triggering the menu as normal so we need to control open state ourselves
              e.preventDefault();
              // Menu button click shouldn't fire click events for the whole tile
              e.stopPropagation();
              toggleMenu(menuItemsToShow);
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          ariaLabel={translate(FeaturePlacesList.LabelTileMenu)}
        >
          {/*  Div is needed to stop click events from propagating to the whole tile */}
          <div role="presentation" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu
              size="Medium"
              // limiting the width of the menu to the available space on the screen to prevent it from overflowing
              className="max-width-[calc(var(--radix-popover-content-available-width)-2rem)]"
            >
              <MenuSection>
                {menuItems.map(menuItemData => (
                  <MenuItem
                    leading={
                      menuItemData.iconName ? <Icon name={menuItemData.iconName} /> : undefined
                    }
                    key={menuItemData.value}
                    value={menuItemData.value}
                    title={menuItemData.title}
                    onSelect={menuItemData.onSelect}
                  />
                ))}
              </MenuSection>
            </Menu>
          </div>
        </PopoverContent>
      </Popover>
      {isWhyThisAdModalOpen && (
        <QueryClientProvider client={queryClient}>
          <WhyThisAdModal
            open={isWhyThisAdModalOpen}
            onClose={() => setIsWhyThisAdModalOpen(false)}
            universeId={universeId}
            payerName={payerName}
            sponsoredUserCohort={sponsoredUserCohort}
            translate={translate}
          />
        </QueryClientProvider>
      )}
    </div>
  );
};

export default GameTileOverflowMenu;
