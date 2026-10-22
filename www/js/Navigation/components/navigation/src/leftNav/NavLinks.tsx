import { useEffect, useState } from "react";
import classNames from "classnames";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useTranslations } from "@rbx/www-common/i18n";
import { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import { eventData } from "@rbx/core-scripts/meta/event";
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
import { assetUrl } from "@rbx/www-common/asset";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import EntrypointExposure from "@rbx/community-telemetry/EntrypointExposure";
import { getNavCapability, type PlusNavEntries } from "../util/navCapabilities";
import {
  StateLayer,
  blackbirdPathRegex,
  iconContainer,
  interactable,
  navItemClasses,
} from "./navItemStyles";
import theHollowImage from "../images/The Hollow.webp";

const noPlusNavEntries: PlusNavEntries = {
  isPlusSubscriber: false,
  topEntries: null,
  upsellEntry: null,
};
const useNoPlusNavEntries = () => noPlusNavEntries;
const useDisplayName = (user: AuthenticatedUser) => user.displayName ?? "";
const useVerifiedBadge = (user: AuthenticatedUser) => user.hasVerifiedBadge;
const useNoCommunitiesTelemetry = (): { onExpose: () => void; onClick: () => void } | undefined =>
  undefined;

const useCount = (queryKey: QueryKey, getCount: (() => Promise<number>) | undefined) =>
  useQuery({
    queryKey,
    queryFn: () => getCount?.() ?? Promise.resolve(0),
    enabled: getCount != null,
    staleTime: Infinity,
  }).data;

const useRealTimeInvalidation = (event: string, key: string) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const subscribe = getNavCapability("subscribeRealTime");
    return subscribe?.(event, () => queryClient.invalidateQueries({ queryKey: [key] }));
  }, [event, key, queryClient]);
};

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
}) => {
  const AvatarHeadshot = getNavCapability("AvatarHeadshot");
  const UncheckedBadge = getNavCapability("UncheckedBadge");
  const showUncheckedBadge = getNavCapability("shouldShowUncheckedBadge")?.() ?? false;
  return (
    <li>
      <a href="/users/profile" className={classNames(navItemClasses, interactable)}>
        <StateLayer />
        <span className={iconContainer}>
          <span className="radius-circle clip size-600">
            {AvatarHeadshot ? <AvatarHeadshot userId={id} altName={displayName} /> : null}
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
          {showUncheckedBadge && UncheckedBadge ? (
            <span className="flex items-center large:fill large:basis-auto large:padding-x-small large:justify-end">
              <UncheckedBadge />
            </span>
          ) : null}
        </span>
      </a>
    </li>
  );
};

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

const CommunitiesNavItem = ({ currentPath }: { currentPath: string }) => {
  const t = useTranslations("CommonUI.Features");
  const telemetry = (
    getNavCapability("useCommunitiesEntrypointTelemetry") ?? useNoCommunitiesTelemetry
  )();
  // Don't count the entry point when already inside communities.
  const isCurrentPath = /^\/([a-z]{2}\/)?communities(\/|$)/.test(currentPath);
  return (
    <NavItem
      path="/communities"
      isCurrentPath={isCurrentPath}
      icon="icon-regular-three-people"
      text={t("Label.sGroups")}
      onExpose={isCurrentPath ? undefined : telemetry?.onExpose}
      onActivate={isCurrentPath ? undefined : telemetry?.onClick}
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
        <DialogContent className="left-nav-shop-dialog">
          <DialogBody>
            <DialogTitle className="content-emphasis">{tShop("Heading.LeavingRoblox")}</DialogTitle>
            <p className="content-default">{tShop("Description.RetailWebsiteRedirect")}</p>
            <p className="content-default">{tShop("Description.PurchaseAgeWarning")}</p>
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

export const EventNavItem = () => {
  const event = eventData();
  if (!event?.purple) {
    return null;
  }
  const url = event.purple;
  return (
    <li key={url}>
      <a href={url} className="flex">
        <img src={assetUrl(theHollowImage)} alt="The Hollow" className="width-full radius-medium" />
      </a>
    </li>
  );
};

const plusAbbreviate = (num: number, limit: number) => (num > limit ? `${limit}+` : num.toString());

export default function LeftNavigation({ user }: { user: AuthenticatedUser }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const id = user.id!;
  const liveNameForDisplay = (getNavCapability("useLiveUserNameForDisplay") ?? useDisplayName)(
    user,
  );
  const hasVerifiedBadge = (getNavCapability("useHasVerifiedBadge") ?? useVerifiedBadge)(user);
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

  const { isPlusSubscriber, topEntries, upsellEntry } = (
    getNavCapability("usePlusNavEntries") ?? useNoPlusNavEntries
  )(currentPath);

  const friendRequestCount = useCount(
    ["friend-request-count"],
    getNavCapability("getFriendRequestCount"),
  );
  useRealTimeInvalidation("FriendshipNotifications", "friend-request-count");

  const messageUnreadCount = useCount(
    ["message-unread-count"],
    getNavCapability("getMessageUnreadCount"),
  );
  useRealTimeInvalidation("Roblox.Messages.CountChanged", "message-unread-count");

  const tradeInboundCount = useCount(
    ["trade-inbound-count"],
    getNavCapability("getTradeInboundCount"),
  );

  return (
    <nav>
      <ul className="flex flex-col gap-small">
        <ProfileNavItem
          id={id}
          displayName={liveNameForDisplay}
          hasVerifiedBadge={hasVerifiedBadge}
          verifiedBadgeLabel={tBadges("Creator.VerifiedBadgeIconAccessibilityText")}
          isPlusSubscriber={isPlusSubscriber}
        />
        {topEntries}
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
        {upsellEntry}
        <EventNavItem />
      </ul>
    </nav>
  );
}
