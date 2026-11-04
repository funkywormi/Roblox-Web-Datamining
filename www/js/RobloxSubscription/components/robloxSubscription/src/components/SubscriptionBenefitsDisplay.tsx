import { navigateToDeepLink } from "@rbx/core-scripts/deep-link";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useTranslation } from "@rbx/core-scripts/react";
import { ListItem, Icon } from "@rbx/foundation-ui";
import { useProductFeatureBenefits } from "@rbx/subscriptions-common";
import { Fragment, useState } from "react";

import BenefitDetailDialog from "./BenefitDetailDialog";
import { Event } from "../utils/eventsCounter";
import { publishMetric } from "../utils/publishMetric";

import type {
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
} from "@rbx/client-subscriptions-api/v2";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { ProductFeatureBenefit, ProductFeatureBenefitId } from "@rbx/subscriptions-common";
import type { FC } from "react";

type BenefitLink = {
  /** Site-relative path or absolute URL. Also used in the app when there's no app deep link. */
  webUrl?: string;
  appDeepLink?: string;
};

/** Rows with no link for the current platform open the benefit detail dialog instead. */
const BENEFIT_LINKS: Partial<Record<ProductFeatureBenefitId, BenefitLink>> = {
  avatarBackground: {
    appDeepLink: "roblox://navigation/avatar?customizetab=backgrounds",
  },
  appThemes: {
    webUrl: "/my/account#!/browser-preferences",
    appDeepLink: "roblox://navigation/device_preferences",
  },
  profileFrames: {
    webUrl: "/users/profile/edit?frames",
    appDeepLink: "roblox://navigation/avatar_profile_frames",
  },
  // The app's send flow (currency_transfer) needs a recipient userid, so open Buy Robux instead.
  robuxTransfers: {
    webUrl: "/upgrades/robux",
    appDeepLink: "roblox://navigation/buy_robux",
  },
  trading: {
    webUrl: "/trades",
  },
  ugcPublishing: {
    webUrl: "https://help.roblox.com/hc/articles/203313180-Creating-and-Selling-Avatar-Items",
  },
};

const getBenefitNavigation = (
  link: BenefitLink | undefined,
  isInApp: boolean,
): (() => void) | undefined => {
  const appDeepLink = link?.appDeepLink;
  if (isInApp && appDeepLink != null) {
    return () => {
      navigateToDeepLink(appDeepLink).catch(() => undefined);
    };
  }
  const webUrl = link?.webUrl;
  if (webUrl == null) {
    return undefined;
  }
  return () => {
    window.location.href = webUrl.startsWith("/") ? getAbsoluteUrl(webUrl) : webUrl;
  };
};

export type SubscriptionBenefitsDisplayProps = {
  currentDiscountPercent: number;
  deviceMeta: DeviceMeta;
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  freeTrialOffer?: SubscriptionOffer | null;
};

const SubscriptionBenefitsDisplay: FC<SubscriptionBenefitsDisplayProps> = ({
  currentDiscountPercent,
  deviceMeta,
  featureConfig,
  freeTrialOffer,
}) => {
  const { translate } = useTranslation();
  const benefits = useProductFeatureBenefits({
    currentDiscountPercent,
    featureConfig,
    freeTrialOffer,
  });
  const { isInApp } = deviceMeta;
  const [openBenefit, setOpenBenefit] = useState<ProductFeatureBenefit | null>(null);

  if (benefits.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <div className="gap-y-large flex flex-col">
        <span className="text-heading-small content-emphasis">
          {translate("Heading.PlusBenefits")}
        </span>
        <div className="foundation-web-list-item-container">
          {benefits.map(benefit => {
            const navigate = getBenefitNavigation(BENEFIT_LINKS[benefit.id], isInApp);
            return (
              <ListItem
                key={benefit.id}
                description={benefit.secondary}
                divider="None"
                isContained
                leading={<Icon name={benefit.iconName} size="Medium" />}
                size="Small"
                title={benefit.primary}
                trailing={<Icon name="icon-regular-chevron-small-right" />}
                onSelect={() => {
                  publishMetric(Event.SUBSCRIBER_BENEFIT_CLICK, {
                    benefitId: benefit.id,
                    isInApp: String(isInApp),
                    action: navigate ? "link" : "dialog",
                  });
                  if (navigate) {
                    navigate();
                  } else {
                    setOpenBenefit(benefit);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      <BenefitDetailDialog
        body={openBenefit?.expandedSecondary ?? ""}
        open={openBenefit != null}
        title={openBenefit?.expandedPrimary ?? ""}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setOpenBenefit(null);
          }
        }}
      />
    </Fragment>
  );
};

export default SubscriptionBenefitsDisplay;
