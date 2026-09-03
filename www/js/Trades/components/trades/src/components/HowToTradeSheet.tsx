import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Icon,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetRoot,
  SheetTitle,
  TIconProps,
} from "@rbx/foundation-ui";
import tradesConstants from "../constants/tradesConstants";

type HowToTradeStep = {
  icon: TIconProps["name"];
  titleKey: string;
  descriptionKey?: string;
};

const HOW_TO_TRADE_STEPS: HowToTradeStep[] = [
  {
    icon: "icon-regular-shopping-cart",
    titleKey: "Label.ShopForRobloxLimitedItems",
    descriptionKey: "Label.YouMustOwnALimitedToStartTrading",
  },
  {
    icon: "icon-regular-magnifying-glass",
    titleKey: "Label.FindATrader",
    descriptionKey: "Label.TradeWithUsersThroughTheirProfile",
  },
  {
    icon: "icon-regular-hand-two-arrows-horizontal",
    titleKey: "Label.SendOffer",
    descriptionKey: "Label.ChooseTheItemsYouWantToTrade",
  },
  {
    icon: "icon-filled-hand-two-arrows-horizontal",
    titleKey: "Label.Review",
    descriptionKey: "Label.TheOtherUserReviewsYourOffer",
  },
  {
    icon: "icon-filled-person-clock",
    titleKey: "Label.AwaitResponse",
    descriptionKey: "Label.TheyAcceptRejectOrCounter",
  },
  {
    icon: "icon-regular-two-arrows-left-right",
    titleKey: "Label.CompleteTheTrade",
  },
];

export type HowToTradeSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onShopClick?: () => void;
  onLearnMoreClick?: () => void;
};

/**
 * Walks through the trade flow, opened from the info button in the list header.
 *
 * Foundation's Sheet is adaptive, so this covers both presentations the design
 * calls for: a bottom sheet on narrow viewports, and — via
 * `largeScreenVariant="center"` — a centered modal on wide ones.
 */
export const HowToTradeSheet = ({
  isOpen,
  onOpenChange,
  onShopClick,
  onLearnMoreClick,
}: HowToTradeSheetProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        largeScreenVariant="center"
        className="trades-sheet"
        mobilePortraitClassName="trades-sheet-full-bleed"
        closeLabel={translate("Action.Close")}
      >
        <SheetTitle>{translate("Header.HowToTrade")}</SheetTitle>

        <SheetBody>
          <ol className="how-to-trade-steps">
            {HOW_TO_TRADE_STEPS.map(step => (
              <li key={step.titleKey} className="how-to-trade-step">
                <Icon name={step.icon} size="Large" className="how-to-trade-step-icon" />
                <div>
                  <div className="how-to-trade-step-title">{translate(step.titleKey)}</div>
                  {step.descriptionKey && (
                    <div className="how-to-trade-step-description">
                      {translate(step.descriptionKey)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </SheetBody>

        <SheetActions className="how-to-trade-actions">
          <Button
            as="a"
            href={tradesConstants.urls.limitedsCatalog}
            onClick={onShopClick}
            variant="Emphasis"
            size="Medium"
          >
            {translate("Action.Shop")}
          </Button>
          <Button
            as="a"
            href={translate("Link.HowToTrade")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLearnMoreClick}
            variant="Standard"
            size="Medium"
            icon="icon-regular-arrow-up-right-from-square"
          >
            {translate("Action.LearnMore")}
          </Button>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default HowToTradeSheet;
