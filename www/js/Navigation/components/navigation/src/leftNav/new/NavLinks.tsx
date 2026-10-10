import { Fragment, useEffect, useState } from "react";
import classNames from "classnames";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import * as http from "@rbx/core-scripts/http";
import { useFormatter, useTranslations } from "@rbx/www-common/i18n";
import { isReferralEnabled as isPlusReferralRolloutEnabled } from "@rbx/core-scripts/meta/subscription";
import { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  Icon,
  TIconProps,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Button,
  Badge,
} from "@rbx/foundation-ui";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { UncheckedBadge, showUncheckedBadge } from "@rbx/identity-badges";
import {
  PLUS_REFERRALS_PATH,
  PlusReferralSheet,
  PlusReferralSurface,
  REFERRAL_REWARD_ROBUX,
  referralEventService,
  useIsPlusSubscriber,
  usePendingPlusReferrals,
  useSenderReferralEligibility,
  type SubscriptionReferral,
} from "@rbx/subscriptions-common";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import {
  EntrypointExposure,
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  useEntrypointImpressionId,
} from "@rbx/community-telemetry";
import { useRealTime } from "./useRealTime";
import { withApiMetrics } from "../observability";
import { useLiveUserNameForDisplay } from "../../hooks/useLiveUserNameForDisplay";
import {
  recordReferralNavClick,
  shouldShowReferralEntry,
  shouldShowReferralNewBadge,
  type ReferralNavEntry,
} from "../../util/plusReferralBadgeUtil";

// Temporarily copied from `@rbx/foundation-ui` since the NavigationRail component is not available yet.
const interactable =
  "relative clip group/interactable focus-visible:outline-focus disabled:outline-none";

const StateLayer = () => (
  <div
    role="presentation"
    className="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"
  />
);

const navItemClasses =
  "content-emphasis text-title-large flex items-center gap-small padding-left-xsmall padding-right-xxsmall radius-medium";

const iconContainer = "size-1000 grow-0 shrink-0 basis-auto flex justify-center items-center";

const ProfileNavItem = ({
  id,
  displayName,
  hasVerifiedBadge,
  verifiedBadgeLabel,
  isPlusSubscriber,
}: {
  id: number;
  displayName: string;
  hasVerifiedBadge: boolean;
  verifiedBadgeLabel: string;
  isPlusSubscriber: boolean;
}) => (
  <li>
    <a href="/users/profile" className={classNames(navItemClasses, interactable)}>
      <StateLayer />
      <span className={iconContainer}>
        <span className="radius-circle clip size-600">
          <Thumbnail2d
            targetId={id}
            type={ThumbnailTypes.avatarHeadshot}
            altName={displayName}
            includeProfileFrame
          />
        </span>
      </span>
      <span className="flex flex-col gap-xsmall min-width-0 large:flex-row large:align-items-center">
        <span className="flex gap-xsmall min-width-0 align-items-center">
          <span className="text-truncate-end text-no-wrap">{displayName}</span>
          {hasVerifiedBadge ? (
            <VerifiedBadgeIcon size="Small" titleText={verifiedBadgeLabel} />
          ) : null}
          {isPlusSubscriber ? <Icon name="icon-regular-roblox-plus" size="Small" /> : null}
        </span>
        {showUncheckedBadge() ? (
          <span className="flex items-center large:fill large:basis-auto large:padding-x-small large:justify-end">
            <UncheckedBadge />
          </span>
        ) : null}
      </span>
    </a>
  </li>
);

const NavItem = ({
  path,
  isCurrentPath,
  icon,
  text,
  notification,
  onExpose,
  onActivate,
}: {
  path: `/${string}` | URL;
  isCurrentPath: boolean;
  icon: TIconProps["name"];
  text: string;
  notification?: string;
  onExpose?: () => void;
  onActivate?: () => void;
}) => {
  const href = path instanceof URL ? path.href : getAbsoluteUrl(path);
  const anchor = (
    <a
      href={href}
      className={classNames(navItemClasses, interactable, isCurrentPath && "bg-shift-200")}
      onClick={onActivate}
    >
      <StateLayer />
      <span className={iconContainer}>
        <Icon name={icon} size="Large" />
      </span>
      <span className="min-width-0 text-truncate-end text-no-wrap">{text}</span>
      {notification && (
        <span className="fill basis-auto padding-x-small flex justify-end items-center">
          <Badge label={notification} variant="Contrast" />
        </span>
      )}
    </a>
  );
  return (
    <li key={href}>
      {onExpose ? <EntrypointExposure onExposure={onExpose}>{anchor}</EntrypointExposure> : anchor}
    </li>
  );
};

const LEFT_NAV_CONTEXT = "leftNav";
const LEFT_NAV_ENTRY_POINT = "leftNav";

const CommunitiesNavItem = ({ currentPath }: { currentPath: string }) => {
  const t = useTranslations("CommonUI.Features");
  const entrypointImpressionId = useEntrypointImpressionId();
  // Don't count the entry point when already inside communities.
  const isCurrentPath = /^\/([a-z]{2}\/)?communities(\/|$)/.test(currentPath);
  return (
    <NavItem
      path="/communities"
      isCurrentPath={isCurrentPath}
      icon="icon-regular-three-people"
      text={t("Label.sGroups")}
      onExpose={
        isCurrentPath
          ? undefined
          : () => {
              logCmntyEntrypointExposureEvent({
                context: LEFT_NAV_CONTEXT,
                entryPoint: LEFT_NAV_ENTRY_POINT,
                entrypointImpressionId,
              });
            }
      }
      onActivate={
        isCurrentPath
          ? undefined
          : () => {
              logCmntyEntrypointClickEvent({
                context: LEFT_NAV_CONTEXT,
                entryPoint: LEFT_NAV_ENTRY_POINT,
                entrypointImpressionId,
              });
            }
      }
    />
  );
};

const ShopNavItem = () => {
  const tFeatures = useTranslations("CommonUI.Features");
  const tShop = useTranslations("Feature.ShopDialog");
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        className={classNames("bg-none width-full stroke-none", navItemClasses, interactable)}
        onClick={() => {
          setShopDialogOpen(!shopDialogOpen);
        }}
      >
        <StateLayer />
        <span className={iconContainer}>
          <Icon name="icon-regular-building-store" size="Large" />
        </span>
        <span>{tFeatures("Label.OfficialStore")}</span>
      </button>
      <Dialog
        open={shopDialogOpen}
        size="Medium"
        isModal
        hasCloseAffordance
        closeLabel={tFeatures("Action.Close")}
        onOpenChange={() => {
          setShopDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogBody>
            <DialogTitle>{tShop("Heading.LeavingRoblox")}</DialogTitle>
            <p>{tShop("Description.RetailWebsiteRedirect")}</p>
            <p>{tShop("Description.PurchaseAgeWarning")}</p>
          </DialogBody>
          <DialogFooter className="flex gap-medium justify-end">
            <Button
              variant="Standard"
              onClick={() => {
                setShopDialogOpen(false);
              }}
            >
              {tShop("Action.Cancel")}
            </Button>
            <Button
              as="a"
              variant="Emphasis"
              href={decodeURIComponent(environmentUrls.amazonWebStoreLink)}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                setShopDialogOpen(false);
                sendEventWithTarget("clickContinueToAmazonStore", "click", {}, targetTypes.WWW);
              }}
            >
              {tShop("Action.Continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
};

const blackbirdPathRegex = /^\/plus(\/|$)/;

const BlackbirdNavItem = ({ currentPath }: { currentPath: string }) => {
  const t = useTranslations("Feature.RobloxSubscription");

  return (
    <NavItem
      path="/plus"
      isCurrentPath={blackbirdPathRegex.test(currentPath)}
      icon="icon-regular-roblox-plus"
      text={t("Label.Blackbird")}
    />
  );
};

/** Card layout shared by the referral entries, pinned above the nav links. */
const ReferralNavItem = ({
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
  const format = useFormatter();
  const rewardAmount = format.number(REFERRAL_REWARD_ROBUX);

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

/**
 * Recipient side of the same entry, for a non-subscriber with an invite waiting. The invite opens
 * over the current page — only subscribing navigates — and carries the referrer for credit.
 */
const BlackbirdJoinReferralNavItem = ({ referral }: { referral: SubscriptionReferral }) => {
  const t = useTranslations("Feature.RobloxSubscription");
  const format = useFormatter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const rewardAmount = format.number(REFERRAL_REWARD_ROBUX);
  const referrerId = String(referral.senderUserId);

  return (
    <Fragment>
      <ReferralNavItem
        entry="join"
        label={
          t.has("Heading.ReferralRecipientEntry")
            ? t("Heading.ReferralRecipientEntry", { amount: rewardAmount })
            : `Join Plus to get ${rewardAmount} Robux`
        }
        onSelect={() => {
          referralEventService.flyoutJoinClick(referrerId);
          setIsInviteOpen(true);
        }}
        onExpose={() => {
          referralEventService.flyoutJoinImpression(referrerId);
        }}
      />
      <PlusReferralSheet
        invite={{ referrerId }}
        open={isInviteOpen}
        surface={PlusReferralSurface.Flyout}
        onOpenChange={setIsInviteOpen}
      />
    </Fragment>
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

const plusAbbreviate = (num: number, limit: number) => (num > limit ? `${limit}+` : num.toString());

export default function LeftNavigation({ user }: { user: AuthenticatedUser }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const id = user.id!;
  const liveNameForDisplay = useLiveUserNameForDisplay(user);
  const [currentPath, setCurrentPath] = useState(new URL(window.location.href).pathname);

  // Observe route changes
  useEffect(() => {
    let oldPath = new URL(window.location.href).pathname;
    const observer = new MutationObserver(() => {
      const newPath = new URL(window.location.href).pathname;
      if (oldPath !== newPath) {
        oldPath = newPath;
        setCurrentPath(newPath);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const t = useTranslations("CommonUI.Features");
  const tBadges = useTranslations("Feature.ProfileBadges");

  // Not `isBlackbirdUser`: the page-load meta tag still says no on the screen that follows a
  // purchase, which left the recipient entry up and the share entry hidden until a reload.
  const isBlackbird = useIsPlusSubscriber();
  const isReferralRolloutEnabled = isPlusReferralRolloutEnabled();
  const { eligibility: senderEligibility } = useSenderReferralEligibility({
    enabled: isReferralRolloutEnabled && isBlackbird,
  });
  const { latestPendingReferral } = usePendingPlusReferrals();
  // Only a non-subscriber with an invite waiting gets the referral card; everyone else keeps the
  // plain Plus upsell below.
  const pendingReferral = isBlackbird ? undefined : latestPendingReferral;

  const queryClient = useQueryClient();

  const { data: friendRequestCount } = useQuery({
    queryKey: ["friend-request-count"],
    queryFn: () =>
      withApiMetrics("FriendRequestCount", () =>
        http
          .get<{ count: number }>({
            url: `${environmentUrls.friendsApi}/v1/user/friend-requests/count`,
            withCredentials: true,
          })
          .then(({ data }) => data.count),
      ),
    staleTime: Infinity,
  });

  useRealTime({
    event: "FriendshipNotifications",
    queryKey: ["friend-request-count"],
    queryClient,
  });

  const { data: messageUnreadCount } = useQuery({
    queryKey: ["message-unread-count"],
    queryFn: () =>
      withApiMetrics("MessageUnreadCount", () =>
        http
          .get<{ count: number }>({
            url: `${environmentUrls.privateMessagesApi}/v1/messages/unread/count`,
            withCredentials: true,
          })
          .then(({ data }) => data.count),
      ),
    staleTime: Infinity,
  });

  useRealTime({
    event: "Roblox.Messages.CountChanged",
    queryKey: ["message-unread-count"],
    queryClient,
  });

  const { data: tradeInboundCount } = useQuery({
    queryKey: ["trade-inbound-count"],
    queryFn: () =>
      withApiMetrics("TradeInboundCount", () =>
        http
          .get<{ count: number }>({
            url: `${environmentUrls.tradesApi}/v1/trades/inbound/count`,
            withCredentials: true,
          })
          .then(({ data }) => data.count),
      ),
    staleTime: Infinity,
  });

  return (
    <nav>
      <ul className="flex flex-col gap-small">
        <ProfileNavItem
          id={id}
          displayName={liveNameForDisplay}
          hasVerifiedBadge={user.hasVerifiedBadge}
          verifiedBadgeLabel={tBadges("Creator.VerifiedBadgeIconAccessibilityText")}
          isPlusSubscriber={isBlackbird}
        />
        {isReferralRolloutEnabled &&
        isBlackbird &&
        senderEligibility === "Eligible" &&
        !blackbirdPathRegex.test(currentPath) &&
        shouldShowReferralEntry("share") ? (
          <BlackbirdReferralNavItem />
        ) : null}
        {pendingReferral ? <BlackbirdJoinReferralNavItem referral={pendingReferral} /> : null}
        <NavItem
          path="/home"
          isCurrentPath={/^\/([a-z]{2}\/)?home(\/|$)/.test(currentPath)}
          icon="icon-regular-house"
          text={t("Label.sHome")}
        />
        <NavItem
          path="/users/profile"
          isCurrentPath={/^\/([a-z]{2}\/)?users\/(\d+\/)?profile(\/|$)/.test(currentPath)}
          icon="icon-regular-person"
          text={t("Label.sProfile")}
        />
        <BlackbirdNavItem currentPath={currentPath} />
        <NavItem
          path="/my/messages/#!/inbox"
          isCurrentPath={/^\/([a-z]{2}\/)?my\/messages(\/|$)/.test(currentPath)}
          icon="icon-regular-speech-bubble-align-center"
          text={t("Label.sMessages")}
          notification={messageUnreadCount ? plusAbbreviate(messageUnreadCount, 500) : undefined}
        />
        <NavItem
          path={friendRequestCount ? "/users/friends#!/friend-requests" : "/users/friends"}
          isCurrentPath={/^\/([a-z]{2}\/)?users\/(\d+\/)?friends(\/|$)/.test(currentPath)}
          icon="icon-regular-two-people"
          text={t("Label.Friends")}
          notification={friendRequestCount ? plusAbbreviate(friendRequestCount, 500) : undefined}
        />
        <NavItem
          path="/my/avatar"
          isCurrentPath={/^\/([a-z]{2}\/)?my\/avatar(\/|$)/.test(currentPath)}
          icon="icon-regular-person-standing"
          text={t("Label.sAvatar")}
        />
        <NavItem
          path="/users/inventory"
          isCurrentPath={/^\/([a-z]{2}\/)?users\/(\d+\/)?inventory(\/|$)/.test(currentPath)}
          icon="icon-regular-backpack"
          text={t("Label.sInventory")}
        />
        <NavItem
          path="/trades"
          isCurrentPath={/^\/([a-z]{2}\/)?trades(\/|$)/.test(currentPath)}
          icon="icon-regular-hand-two-arrows-horizontal"
          text={t("Label.sTrade")}
          notification={tradeInboundCount ? plusAbbreviate(tradeInboundCount, 999) : undefined}
        />
        <CommunitiesNavItem currentPath={currentPath} />
        <NavItem
          path={new URL("https://blog.roblox.com")}
          isCurrentPath={false}
          icon="icon-regular-fountain-pen-nib"
          text={t("Label.Newsroom")}
        />
        <ShopNavItem />
        <NavItem
          path="/giftcards-us"
          isCurrentPath={/^\/([a-z]{2}\/)?giftcards-us(\/|$)/.test(currentPath)}
          icon="icon-regular-gift-card"
          text={t("Label.GiftCards")}
        />
        {!isBlackbird && !pendingReferral ? (
          <BlackbirdUpsellNavItem currentPath={currentPath} />
        ) : null}
      </ul>
    </nav>
  );
}
