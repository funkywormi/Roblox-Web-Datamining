import { useTranslation } from "@rbx/core-scripts/react";
import {
  Radio,
  RadioGroup,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetRoot,
  SheetTitle,
} from "@rbx/foundation-ui";

export type TradeQualityOption = {
  value: string;
  label: string;
};

export type TradeQualityFilterSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  options: TradeQualityOption[];
  value: string;
  onSelect: (value: string) => void;
};

/**
 * Account-level minimum quality for incoming trades, opened from the gear in the
 * list header. Like HowToTradeSheet this renders as a bottom sheet on narrow
 * viewports and a centered modal on wide ones.
 */
export const TradeQualityFilterSheet = ({
  isOpen,
  onOpenChange,
  options,
  value,
  onSelect,
}: TradeQualityFilterSheetProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        largeScreenVariant="center"
        className="trades-sheet"
        mobilePortraitClassName="trades-sheet-full-bleed"
        closeLabel={translate("Action.Close")}
      >
        <SheetTitle>{translate("Header.TradeQualityFilter")}</SheetTitle>

        <SheetBody>
          <SheetDescription>
            <p className="trade-quality-sheet-description">
              {translate("Message.TradeQualityMessage")}
            </p>
          </SheetDescription>

          <RadioGroup value={value} onValueChange={onSelect} placement="End" size="Medium">
            {options.map(option => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
};

export default TradeQualityFilterSheet;
