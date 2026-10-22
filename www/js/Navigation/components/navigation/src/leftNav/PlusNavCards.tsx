import { Fragment, useState, type ReactNode } from "react";
import classNames from "classnames";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useFormatter, useTranslations } from "@rbx/www-common/i18n";
import { Icon, Badge } from "@rbx/foundation-ui";
import referralEventService from "@rbx/subscriptions-common/referralEventService";
import {
  PLUS_REFERRALS_PATH,
  REFERRAL_REWARD_ROBUX,
} from "@rbx/subscriptions-common/subscriptionConstants";
import EntrypointExposure from "@rbx/community-telemetry/EntrypointExposure";
import {
  recordReferralNavClick,
  shouldShowReferralEntry,
  shouldShowReferralNewBadge,
  type ReferralNavEntry,
} from "../util/plusReferralBadgeUtil";
import type { PlusNavEntries } from "../util/navCapabilities";
import { StateLayer, blackbirdPathRegex, interactable } from "./navItemStyles";

export const useRewardAmount = (): string => useFormatter().number(REFERRAL_REWARD_ROBUX);

/** Card layout shared by the referral entries, pinned above the nav links. */
export const ReferralNavItem = ({
  href,
  label,
  entry,
  onSelect,
  onExpose,
}: {
  /** Omitted by entries that open a popup in place rather than navigating. */
  href?: string;
  label: string;
  entry: ReferralNavEntry;
  onSelect?: () => void;
  onExpose?: () => void;
}) => {
  const t = useTranslations("Feature.RobloxSubscription");
  const [showNewBadge, setShowNewBadge] = useState(() => shouldShowReferralNewBadge(entry));

  const cardClassName = classNames(
    interactable,
    // Same outlined card as the app / Figma flyout: 12px padding, 12px gap, 24px icon.
    // No 40px icon box — that made this row taller than the Robux/Share Plus cards.
    "bg-none stroke-default stroke-thick width-full gap-medium padding-medium radius-medium text-body-medium content-emphasis flex items-center",
  );

  const onClick = () => {
    recordReferralNavClick(entry);
    setShowNewBadge(false);
    onSelect?.();
  };

  const cardContent = (
    <Fragment>
      <StateLayer />
      <Icon className="shrink-0" name="icon-regular-roblox-plus" size="Large" />
      <span className="min-width-0 text-truncate-end grow-1 text-align-x-left">{label}</span>
      {showNewBadge ? (
        <Badge label={t.has("Label.New") ? t("Label.New") : "New"} variant="Contrast" />
      ) : null}
    </Fragment>
  );

  const card =
    href === undefined ? (
      <button className={cardClassName} type="button" onClick={onClick}>
        {cardContent}
      </button>
    ) : (
      <a className={cardClassName} href={href} onClick={onClick}>
        {cardContent}
      </a>
    );

  return (
    <li>
      {onExpose ? <EntrypointExposure onExposure={onExpose}>{card}</EntrypointExposure> : card}
    </li>
  );
};

/**
 * Referral entry for subscribers. Navigates to `/plus?referrals` so notifications and other entry
 * points share the same destination.
 */
const BlackbirdReferralNavItem = () => {
  const t = useTranslations("Feature.RobloxSubscription");
  const rewardAmount = useRewardAmount();

  return (
    <ReferralNavItem
      entry="share"
      href={getAbsoluteUrl(PLUS_REFERRALS_PATH)}
      label={
        t.has("Heading.ReferralEntry")
          ? t("Heading.ReferralEntry", { amount: rewardAmount })
          : `Share Plus to get ${rewardAmount} Robux`
      }
      onExpose={() => {
        referralEventService.flyoutShareImpression();
      }}
      onSelect={() => {
        referralEventService.flyoutShareClick();
      }}
    />
  );
};

const BlackbirdUpsellNavItem = ({ currentPath }: { currentPath: string }) => {
  const t = useTranslations("Feature.RobloxSubscription");

  if (blackbirdPathRegex.test(currentPath)) {
    return null;
  }

  const card = (
    <a
      href="/plus"
      className="gap-y-medium flex flex-col padding-medium bg-shift-100 stroke-default stroke-thick radius-medium text-body-medium"
      onClick={() => {
        referralEventService.flyoutUpsellClick();
      }}
    >
      <Icon name="icon-regular-roblox-plus" />
      <span>
        {t("Description.ExclusiveBenefits", {
          product: t("Label.Blackbird"),
        })}
      </span>
      <span className="content-default [text-decoration:underline] [text-decoration-skip-ink:none] [text-underline-offset:3px]">
        {t("Action.Subscribe")}
      </span>
    </a>
  );

  return (
    <li className="padding-top-xsmall">
      <EntrypointExposure
        onExposure={() => {
          referralEventService.flyoutUpsellImpression();
        }}
      >
        {card}
      </EntrypointExposure>
    </li>
  );
};

export const plusNavEntries = ({
  currentPath,
  isPlusSubscriber,
  isReferralRolloutEnabled,
  senderEligibility,
  joinEntry,
}: {
  currentPath: string;
  isPlusSubscriber: boolean;
  isReferralRolloutEnabled: boolean;
  senderEligibility: string | undefined;
  joinEntry: ReactNode;
}): PlusNavEntries => ({
  isPlusSubscriber,
  topEntries: (
    <Fragment>
      {isReferralRolloutEnabled &&
      isPlusSubscriber &&
      senderEligibility === "Eligible" &&
      !blackbirdPathRegex.test(currentPath) &&
      shouldShowReferralEntry("share") ? (
        <BlackbirdReferralNavItem />
      ) : null}
      {joinEntry}
    </Fragment>
  ),
  // Only a non-subscriber with an invite waiting gets the referral card; everyone else keeps the
  // plain Plus upsell below.
  upsellEntry:
    !isPlusSubscriber && joinEntry == null ? (
      <BlackbirdUpsellNavItem currentPath={currentPath} />
    ) : null,
});
