import classNames from "classnames";
import { useContext } from "react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Badge, Icon } from "@rbx/foundation-ui";
import { useFullKeyTranslations, useTranslations } from "@rbx/www-common/i18n";
import { getIsNativePurchasePlatform } from "../../utils/platform";
import { isIconVariant } from "../../utils/iconVariants";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";

// Amount text floors: base, 361px, 400px, 1141px. Icon sizes are .robux-amount-icon and
// .robux-amount-strike-icon in main.css; the size prop matches the base floor.
const robuxTextClassName =
  "text-title-large small:text-heading-small min-[400px]:text-heading-medium large:text-heading-large";
const strikeThroughTextClassName =
  "text-title-medium min-[400px]:text-title-large large:text-heading-small";

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
  const { productBadgeSlotCount, deviceMeta } = useContext(BuyRobuxPageContext);
  const isNativePurchasePlatform = getIsNativePurchasePlatform(deviceMeta);
  const translatePremium = useTranslations("Feature.Premium");
  const { translateFullKey } = useFullKeyTranslations();

  const formattedBonusRobuxAmount = bonusRobuxAmount
    ? formatNumber(Number(bonusRobuxAmount))
    : undefined;

  const fallbackBonusRobuxTagLabel = translatePremium("Label.PlusAmountMoreLower", {
    amount: formattedBonusRobuxAmount ?? "",
  });

  return (
    <div
      className={`robux-amount-item flex ${nonPromotionalAmount ? "flex-col" : "flex-row"} num-badges-${productBadgeSlotCount} justify-start gap-small wrap`}
    >
      {/* Robux Amount */}
      <div className="flex gap-small items-center">
        <div
          className={`flex flex-row justify-start items-center gap-small margin-right-xsmall ${bonusRobuxTagIcon ? "medium:width-[230px]" : "large:width-[230px]"} wrap`}
          data-testid="robux-amount-column"
        >
          <div className="flex flex-row justify-start items-center gap-xsmall content-emphasis">
            <Icon name="icon-filled-robux" size="Small" className="robux-amount-icon" />
            <span className={robuxTextClassName} style={{ lineHeight: "var(--line-height-100)" }}>
              {formatNumber(Number(amount))}
            </span>
          </div>
          {/* Crossed out Robux Amount */}
          {nonPromotionalAmount && (
            <div className="flex flex-row justify-start items-center gap-xsmall relative text-overflow content-muted">
              <div className="robux-amount-strike-through" />
              <Icon name="icon-filled-robux" size="XSmall" className="robux-amount-strike-icon" />
              <span className={strikeThroughTextClassName}>
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
                label={
                  bonusRobuxTagTranslationKey
                    ? translateFullKey(
                        bonusRobuxTagTranslationKey,
                        {
                          amount: formattedBonusRobuxAmount ?? "",
                        },
                        fallbackBonusRobuxTagLabel,
                      )
                    : fallbackBonusRobuxTagLabel
                }
              />
            ) : (
              // On non-large screens, only show for when in-app.
              <div
                className={classNames(isNativePurchasePlatform ? "block" : "hidden", "large:block")}
                data-testid="bonus-pill"
              >
                <BadgeWrapper label={fallbackBonusRobuxTagLabel} />
              </div>
            ))}
          {inlineBadgeTranslationKey && (
            <BadgeWrapper
              icon={inlineBadgeIcon}
              label={translateFullKey(inlineBadgeTranslationKey)}
            />
          )}
        </div>
      )}
    </div>
  );
}
