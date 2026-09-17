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

/** Discounts the membership advertises, as shown in the benefits list. */
const ITEM_DISCOUNT_PERCENT = 10;
const AGED_ITEM_DISCOUNT_PERCENT = 20;
const AGED_ITEM_DISCOUNT_MONTHS = 2;

const BENEFITS: {
  icon: TIconProps["name"];
  labelKey: string;
  values?: Record<string, number>;
}[] = [
  {
    icon: "icon-regular-hand-two-arrows-horizontal",
    labelKey: "Label.UnlimitedTradesPerMonth",
  },
  {
    icon: "icon-regular-tag",
    labelKey: "Label.PercentOffInGameItemsAvatarsAndMore",
    values: { percent: ITEM_DISCOUNT_PERCENT },
  },
  {
    icon: "icon-regular-tag-arrow-up",
    labelKey: "Label.PercentOffTheseItemsAfterMonths",
    values: { percent: AGED_ITEM_DISCOUNT_PERCENT, months: AGED_ITEM_DISCOUNT_MONTHS },
  },
  {
    icon: "icon-regular-controller",
    labelKey: "Label.FreeAndUnlimitedPrivateServers",
  },
  {
    icon: "icon-regular-robux",
    labelKey: "Label.SendRobuxForFree",
  },
];

export type TradePlusUpsellSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGetPlusClick?: () => void;
  /** Overrides the default unlimited-trades heading when the send was about Robux. */
  titleKey?: string;
};

/**
 * Membership pitch shown in place of sending or accepting a trade the server
 * would reject: the monthly allowance is spent, or Robux is in the offer
 * without the membership that allows it. Like the other trades sheets this is
 * a bottom sheet on narrow viewports and a centred modal on wide ones.
 */
export const TradePlusUpsellSheet = ({
  isOpen,
  onOpenChange,
  onGetPlusClick,
  titleKey = "Header.GetUnlimitedTradesWithPlus",
}: TradePlusUpsellSheetProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        largeScreenVariant="center"
        className="trades-sheet trades-sheet-flush-actions"
        mobilePortraitClassName="trades-sheet-full-bleed"
        closeLabel={translate("Action.Close")}
      >
        <SheetTitle>
          <span className="trade-plus-upsell-title">
            <Icon name="icon-regular-roblox-plus" size="Large" />
            {translate(titleKey)}
          </span>
        </SheetTitle>

        <SheetBody>
          <ul className="trade-plus-benefits">
            {BENEFITS.map(benefit => (
              <li key={benefit.labelKey} className="trade-plus-benefit">
                <Icon
                  name={benefit.icon}
                  size="Medium"
                  className="trade-plus-benefit-icon"
                  aria-hidden
                />
                {translate(benefit.labelKey, benefit.values)}
              </li>
            ))}
          </ul>
        </SheetBody>

        <SheetActions className="trade-plus-upsell-actions">
          <Button
            as="a"
            href={tradesConstants.urls.membership}
            onClick={onGetPlusClick}
            variant="Emphasis"
            size="Medium"
          >
            {translate("Action.GetPlus")}
          </Button>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default TradePlusUpsellSheet;
