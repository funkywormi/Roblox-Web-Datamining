import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";

import type { FC, ReactNode } from "react";

export type SavingsDashboardProps = {
  /** Resolved discount % the user effectively has on this product (0–100). */
  currentDiscountPercent: number;
  savedRobux?: number;
  itemsBoughtWithDiscountCount?: number;
  privateServersCreatedCount?: number;
  robuxSentToFriendsCount?: number;
};

type StatCardProps = {
  title: string;
  value: ReactNode;
};

const StatCard: FC<StatCardProps> = ({ title, value }) => (
  <div className="radius-medium bg-shift-200 padding-large gap-y-small min-width-0 grow-1 flex basis-0 flex-col">
    <span className="text-title-medium content-default">{title}</span>
    <span className="text-heading-large content-emphasis">{value}</span>
  </div>
);

const SavingsDashboard: FC<SavingsDashboardProps> = ({
  currentDiscountPercent,
  savedRobux,
  itemsBoughtWithDiscountCount,
  privateServersCreatedCount,
  robuxSentToFriendsCount,
}) => {
  const { translate, intl } = useTranslation();

  return (
    <div className="gap-y-large flex flex-col">
      <div className="gap-x-xsmall text-heading-small content-emphasis wrap flex items-center">
        <span>{translate("Heading.SavingsYouveSaved")}</span>
        <Icon name="icon-regular-robux" size="Medium" />
        <span>{savedRobux === undefined ? "—" : intl.n(savedRobux)}</span>
        <span>{translate("Heading.SavingsWithPlus")}</span>
      </div>
      <div className="gap-y-small flex flex-col">
        <div className="gap-x-small flex">
          <StatCard
            title={translate("Label.Savings.InGameItems")}
            value={translate("Label.Savings.PercentOff", {
              discountPercent: intl.n(currentDiscountPercent * 0.01, {
                style: "percent",
              }),
            })}
          />
          <StatCard
            title={translate("Label.Savings.ItemsBought")}
            value={
              itemsBoughtWithDiscountCount === undefined
                ? "—"
                : intl.n(itemsBoughtWithDiscountCount)
            }
          />
        </div>
        <div className="gap-x-small flex">
          <StatCard
            title={translate("Label.Savings.PrivateServers")}
            value={
              privateServersCreatedCount === undefined ? "—" : intl.n(privateServersCreatedCount)
            }
          />
          <StatCard
            title={translate("Label.Savings.RobuxSent")}
            value={
              <span className="gap-x-xsmall flex items-center">
                <Icon name="icon-regular-robux" size="Medium" />
                {robuxSentToFriendsCount === undefined ? "—" : intl.n(robuxSentToFriendsCount)}
              </span>
            }
          />
        </div>
        <span className="text-caption-medium content-muted">
          {translate("Description.SavingsDataDelay")}
        </span>
      </div>
    </div>
  );
};

export default SavingsDashboard;
