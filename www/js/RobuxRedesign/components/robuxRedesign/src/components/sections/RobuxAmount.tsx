import classNames from "classnames";
import { useContext } from "react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Badge, Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useResponsiveValue } from "@rbx/payments/hooks";
import { isInApp } from "../../utils/platform";
import { isIconVariant } from "../../utils/iconVariants";
import {
  BONUS_ROBUX_TAG_FALLBACK_KEY,
  resolveBonusRobuxTagLabelKey,
} from "../../utils/bonusRobuxTag";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";

const BadgeWrapper = ({ icon, label }: { icon?: string; label: string }) => {
  const hasIcon = icon && isIconVariant(icon);
  return (
    <Badge
      variant="Neutral"
      icon={hasIcon ? icon : undefined}
      label={label}
      className="text-overflow"
    />
  );
};

export type RobuxAmountProps = {
  amount: string;
  nonPromotionalAmount?: string;
  inlineBadgeIcon?: string;
  inlineBadgeTranslationKey?: string;
  isCompact?: boolean;
  bonusRobuxAmount?: string;
  bonusRobuxTagIcon?: string;
  bonusRobuxTagTranslationKey?: string;
};

export function RobuxAmount({
  amount,
  nonPromotionalAmount,
  inlineBadgeIcon,
  inlineBadgeTranslationKey,
  bonusRobuxAmount,
  bonusRobuxTagIcon,
  bonusRobuxTagTranslationKey,
}: RobuxAmountProps) {
  const { productBadgeSlotCount } = useContext(BuyRobuxPageContext);
  const { translate } = useTranslation();

  const responsiveStyle = useResponsiveValue(
    {
      robuxIcon: "Small",
      robuxTextSize: "text-title-large",
      strikeThroughRobuxIcon: "XSmall",
      strikeThroughRobuxTextSize: "text-title-medium",
    } as const,
    {
      small: {
        robuxIcon: "Medium",
        robuxTextSize: "text-heading-small",
        strikeThroughRobuxIcon: "Small",
        strikeThroughRobuxTextSize: "text-title-medium",
      } as const,
      400: {
        robuxIcon: "Large",
        robuxTextSize: "text-heading-medium",
        strikeThroughRobuxIcon: "Medium",
        strikeThroughRobuxTextSize: "text-title-large",
      } as const,
      large: {
        robuxIcon: "XLarge",
        robuxTextSize: "text-heading-large",
        strikeThroughRobuxIcon: "Large",
        strikeThroughRobuxTextSize: "text-heading-small",
      } as const,
    },
  );

  const formattedBonusRobuxAmount = bonusRobuxAmount
    ? formatNumber(Number(bonusRobuxAmount))
    : undefined;

  const bonusRobuxTagLabelKey = resolveBonusRobuxTagLabelKey(bonusRobuxTagTranslationKey);

  return (
    <div
      className={`flex ${nonPromotionalAmount ? "flex-col" : "flex-row"} num-badges-${productBadgeSlotCount} justify-start gap-small wrap`}
    >
      {/* Robux Amount */}
      <div className="flex gap-small items-center">
        <div
          className={`flex flex-row justify-start items-center gap-small margin-right-xsmall ${bonusRobuxTagIcon ? "medium:width-[230px]" : "large:width-[230px]"} wrap`}
          data-testid="robux-amount-column"
        >
          <div className="flex flex-row justify-start items-center gap-xsmall content-emphasis">
            <Icon name="icon-filled-robux" size={responsiveStyle.robuxIcon} />
            <span
              className={responsiveStyle.robuxTextSize}
              style={{ lineHeight: "var(--line-height-100)" }}
            >
              {formatNumber(Number(amount))}
            </span>
          </div>
          {/* Crossed out Robux Amount */}
          {nonPromotionalAmount && (
            <div className="flex flex-row justify-start items-center gap-xsmall relative text-overflow content-muted">
              <div className="robux-amount-strike-through" />
              <Icon name="icon-filled-robux" size={responsiveStyle.strikeThroughRobuxIcon} />
              <span className={responsiveStyle.strikeThroughRobuxTextSize}>
                {formatNumber(Number(nonPromotionalAmount))}
              </span>
            </div>
          )}
        </div>
      </div>

      {(bonusRobuxAmount ?? inlineBadgeTranslationKey) && (
        <div className="flex flex-row gap-small">
          {bonusRobuxAmount &&
            (bonusRobuxTagIcon ? (
              <BadgeWrapper
                icon={bonusRobuxTagIcon}
                label={translate(bonusRobuxTagLabelKey, {
                  amount: formattedBonusRobuxAmount,
                })}
              />
            ) : (
              // On non-large screens, only show for when in-app.
              <div
                className={classNames(isInApp ? "block" : "hidden", "large:block")}
                data-testid="bonus-pill"
              >
                <BadgeWrapper
                  label={translate(BONUS_ROBUX_TAG_FALLBACK_KEY, {
                    amount: formattedBonusRobuxAmount,
                  })}
                />
              </div>
            ))}
          {inlineBadgeTranslationKey && (
            <BadgeWrapper icon={inlineBadgeIcon} label={translate(inlineBadgeTranslationKey)} />
          )}
        </div>
      )}
    </div>
  );
}
