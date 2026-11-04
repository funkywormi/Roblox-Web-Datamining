import { Icon, List } from "@rbx/foundation-ui";
import { Fragment } from "react";

import { useProductFeatureBenefits } from "../../hooks/useProductFeatureBenefits";

import type {
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
} from "@rbx/client-subscriptions-api/v2";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import type { FC } from "react";

type ProductFeaturesDisplayRowProps = {
  expandedPrimary: string;
  expandedSecondary: string;
  iconName: TTailwindIconClass;
  onTileClick?: (primary: string, secondary: string) => void;
  primary: string;
  secondary: string;
};

const tileCardClassName =
  "min-width-0 grow-1 gap-x-large radius-medium !bg-surface-100 stroke-standard stroke-default padding-medium box-border flex items-center";

const ProductFeaturesDisplayRow: FC<ProductFeaturesDisplayRowProps> = ({
  expandedPrimary,
  expandedSecondary,
  iconName,
  onTileClick,
  primary,
  secondary,
}) => {
  const tileBody = (
    <Fragment>
      <div className="flex shrink-0 items-center justify-center">
        <Icon name={iconName} size="Large" />
      </div>
      <div className="min-width-0 grow-1 gap-xsmall flex flex-col justify-center">
        <div className="text-title-medium content-emphasis text-align-x-start">{primary}</div>
        <div className="text-body-medium content-default text-align-x-start">{secondary}</div>
      </div>
    </Fragment>
  );

  return (
    <li className="min-width-0 flex list-none flex-col [list-style:none]">
      {onTileClick != null ? (
        <button
          aria-label={primary}
          className={`${tileCardClassName} width-full text-align-x-start cursor-pointer font-[inherit]`}
          type="button"
          onClick={() => {
            onTileClick(expandedPrimary, expandedSecondary);
          }}
        >
          {tileBody}
        </button>
      ) : (
        <div className={tileCardClassName}>{tileBody}</div>
      )}
    </li>
  );
};

export type ProductFeaturesListProps = {
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  periodType: PeriodType;
  overrideIconName?: TTailwindIconClass;
  onTileClick?: (primary: string, secondary: string) => void;
  /**
   * Adds referring as a benefit tile. Opt-in because it is not part of the product's feature
   * config: only surfaces shown to an existing subscriber can act on it.
   */
  includeReferralBenefit?: boolean;
  freeTrialOffer?: SubscriptionOffer | null;
};

const ProductFeaturesList: FC<ProductFeaturesListProps> = ({
  featureConfig,
  overrideIconName,
  onTileClick,
  includeReferralBenefit = false,
  freeTrialOffer,
}) => {
  const benefits = useProductFeatureBenefits({
    featureConfig,
    freeTrialOffer,
    includeReferralBenefit,
  });

  return (
    <List className="width-full large:[grid-template-columns:repeat(2,minmax(0,1fr))] grid gap-x-[12px] gap-y-[12px] [grid-template-columns:minmax(0,1fr)]">
      {benefits.map(benefit => (
        <ProductFeaturesDisplayRow
          key={benefit.id}
          expandedPrimary={benefit.expandedPrimary}
          expandedSecondary={benefit.expandedSecondary}
          iconName={overrideIconName ?? benefit.iconName}
          primary={benefit.primary}
          secondary={benefit.secondary}
          onTileClick={onTileClick}
        />
      ))}
    </List>
  );
};

export default ProductFeaturesList;
