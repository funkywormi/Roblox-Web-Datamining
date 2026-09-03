import { useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import { CollectibleItemMetadata } from "../../types/buyRobuxPageData";
import { BlueCheckIcon } from "../BlueCheckIcon";

const pacificDateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

// Update this when reusing the collectible item banner for a new campaign.
const CAMPAIGN_END_DATE_UTC = Date.UTC(2026, 3, 1); // April 1, 2026

function getDaysUntilCampaignEnd(): number {
  const parts = pacificDateFormat.formatToParts(new Date());
  const year = Number(parts.find(p => p.type === "year")?.value);
  const month = Number(parts.find(p => p.type === "month")?.value);
  const day = Number(parts.find(p => p.type === "day")?.value);

  const todayUtc = Date.UTC(year, month - 1, day);

  return Math.max(Math.ceil((CAMPAIGN_END_DATE_UTC - todayUtc) / (1000 * 60 * 60 * 24)), 0);
}

type BannerProps = {
  metadata: CollectibleItemMetadata;
};

export function CollectibleItemBonusBanner({ metadata }: BannerProps) {
  const { translate } = useTranslation();

  const daysRemaining = useMemo(() => getDaysUntilCampaignEnd(), []);

  return (
    <div
      className="collectible-item-bonus-item-banner flex flex-row gap-large self-stretch items-center justify-start overflow-hidden padding-x-medium padding-bottom-medium padding-top-large medium:padding-x-xlarge buy-robux-page"
      style={{
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
      }}
    >
      <img
        src={metadata.image2dUrl}
        alt="bonus item"
        className="min-width-2000 max-width-2000 min-height-2000 max-height-2000 medium:min-width-3000 medium:max-width-3000 medium:min-height-3000 medium:max-height-3000"
      />
      <div className="flex flex-col gap-small medium:gap-medium self-stretch items-start justify-center">
        <div className="text-title-large medium:text-heading-small content-emphasis text-wrap">
          {translate(metadata.translationKey)}
        </div>
        <div className="flex flex-col small:flex-row gap-medium self-stretch items-start justify-start">
          <div className="flex flex-row gap-xsmall self-stretch items-center justify-start">
            <div className="text-label-small medium:text-label-medium content-default">
              {translate("Label.ByRoblox")}
            </div>
            <BlueCheckIcon size={12} />
          </div>
          <Badge
            variant="Contrast"
            icon="icon-regular-clock"
            label={translate(daysRemaining === 1 ? "Label.LastDay" : "Label.DaysLeft", {
              daysLeft: daysRemaining,
            })}
            className="text-overflow"
          />
        </div>
      </div>
    </div>
  );
}
