import { useEffect, useState } from "react";
import { Button } from "@rbx/foundation-ui";
import RobloxPlusPrivateServerUpsellBanner from "@rbx/subscriptions-common/RobloxPlusPrivateServerUpsellBanner";
import { useTranslation } from "@rbx/core-scripts/react";
import Intl from "@rbx/core-scripts/intl";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { isBlackbirdUser as getIsPlusUser } from "@rbx/core-scripts/meta/user";
import { ThumbnailTypes } from "@rbx/thumbnails";
import type { TServerListMetadata } from "../../hooks/useServerListMetadata";
import useServerList from "../../../../js/serverList/containers/useServerList";
import serverListService from "../../../../js/serverList/services/serverListService";
import serverListConstants from "../../../../js/serverList/constants/serverListConstants";
import urlConstants from "../../../../js/serverList/constants/urlConstants";
import * as gameInstanceUtil from "../../../../js/serverList/util/gameInstanceUtil";
import { getDisableRobloxPlusEntrypoints } from "../../services/guacService";
import usePrivateServerUpsellEvents from "../../hooks/usePrivateServerUpsellEvents";
import SectionHeader from "./SectionHeader";
import CreateServerRow from "./CreateServerRow";
import ServerListItem from "./ServerListItem";

const { getJoinScript, canCreatePrivateGameServer } = gameInstanceUtil;

const { resources, serverListTypes } = serverListConstants;

const intl = new Intl();

type PrivateServersSectionProps = {
  serverListMetadata: TServerListMetadata;
  isWebview: boolean;
  onOpenSheet?: () => void;
};

const PrivateServersSection = ({
  serverListMetadata,
  isWebview,
  onOpenSheet,
}: PrivateServersSectionProps) => {
  const { translate } = useTranslation();

  const {
    canCreateServer,
    placeId,
    placeName,
    price,
    privateServerProductId,
    sellerId,
    sellerName,
    universeId,
    privateServerLimit,
    preopenCreatePrivateGame,
    discounts,
  } = serverListMetadata;

  const isPlusUser = getIsPlusUser();
  const { trackSubscribeBannerClick, trackUpsellBannerShown } = usePrivateServerUpsellEvents();

  /** `null` while loading — hide Plus entrypoints until GUAC resolves (avoids fail-open flicker). */
  const [appPolicyDisablePlusEntrypoints, setAppPolicyDisablePlusEntrypoints] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    let cancelled = false;
    getDisableRobloxPlusEntrypoints().then(
      disabled => {
        if (!cancelled) {
          setAppPolicyDisablePlusEntrypoints(disabled);
        }
      },
      () => {
        if (!cancelled) {
          setAppPolicyDisablePlusEntrypoints(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  /** Gated by the GUAC `DisableRobloxPlusEntrypoints` policy (see NavLinks pattern). */
  const hideRobloxPlusEntrypoints = appPolicyDisablePlusEntrypoints !== false;

  const {
    hasNext,
    hasError,
    isBusy,
    loadMoreServers,
    refreshServers,
    servers,
    isReady,
    joinRestricted,
  } = useServerList(
    serverListService.getVipGameInstances,
    !!price,
    placeId,
    serverListConstants.defaultOptions,
  );

  const doesGameSupportPrivateServers = privateServerProductId !== 0;

  // Matches the render condition for `plusUpsellBanner` below (both placements).
  const bannerVisible =
    doesGameSupportPrivateServers &&
    !isPlusUser &&
    canCreateServer &&
    !hideRobloxPlusEntrypoints &&
    (servers.length > 0 || price === 0);
  useEffect(() => {
    if (bannerVisible) trackUpsellBannerShown();
  }, [bannerVisible, trackUpsellBannerShown]);

  const sectionTitle =
    servers.length > 0
      ? translate(resources.yourPrivateServersTitle)
      : translate(resources.privateServerHeader);

  const sectionSubtitle = translate(resources.privateServersSubtitle);

  if (!doesGameSupportPrivateServers) {
    const LINK_MARKER = "\x00";
    const parts = translate(resources.privateServersNotSupported, {
      vipServersLink: LINK_MARKER,
    }).split(LINK_MARKER);

    return (
      <div className="flex flex-col gap-large width-full">
        <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />
        <p className="text-body-medium content-muted">
          {parts[0]}
          <a
            className="content-link"
            href={urlConstants.privateServerHelpUrl(intl.getRobloxLocale())}
          >
            {translate(resources.privateServerHeader)}
          </a>
          {parts[1]}
        </p>
      </div>
    );
  }

  const serversWithOwner = servers.filter(
    (s): s is typeof s & { owner: { id: number } } => s.owner?.id != null,
  );
  const canCreate = isPlusUser || canCreatePrivateGameServer(serversWithOwner, privateServerLimit);

  const plusUpsellBanner = !isPlusUser && canCreateServer && !hideRobloxPlusEntrypoints && (
    <RobloxPlusPrivateServerUpsellBanner
      upsellText={translate(resources.getUnlimitedWithBlackbirdText)}
      subscribeText={translate(resources.subscribeText)}
      onOpenSheet={() => {
        trackSubscribeBannerClick();
        onOpenSheet?.();
      }}
    />
  );

  return (
    <div className="flex flex-col gap-large width-full">
      <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} />

      <div className="flex flex-col width-full">
        {servers.length > 0 && plusUpsellBanner && (
          <div className="padding-bottom-large">{plusUpsellBanner}</div>
        )}

        {canCreateServer && (
          <CreateServerRow
            universeId={universeId}
            placeId={placeId}
            placeName={placeName}
            price={price}
            productId={privateServerProductId}
            sellerId={sellerId}
            sellerName={sellerName}
            isPlusUser={isPlusUser}
            canCreatePrivateServer={canCreate}
            refreshServers={refreshServers}
            isReady={isReady}
            preopenCreatePrivateGame={preopenCreatePrivateGame}
            onOpenSheet={onOpenSheet}
            hasExistingServers={servers.length > 0}
            discounts={discounts}
            disableRobloxPlusEntrypoints={hideRobloxPlusEntrypoints}
          />
        )}

        {servers.length === 0 && price === 0 && plusUpsellBanner && (
          <div className="padding-top-large">{plusUpsellBanner}</div>
        )}

        {servers.length === 0 && !isBusy && hasError && (
          <div className="padding-y-medium">
            <p className="text-body-medium content-muted">
              {translate(resources.loadServersError)}
            </p>
          </div>
        )}

        {isBusy && servers.length === 0 && (
          <div className="padding-y-medium">
            <span className="text-body-medium content-muted">
              {translate(resources.loadingText)}
            </span>
          </div>
        )}

        {servers.map((server, index) => {
          const isOwner = server.owner?.id === authenticatedUser.id;
          const isServerInactive = !!server.vipServerId && !server.accessCode;
          const sub = server.vipServerSubscription;
          const isPaymentCancelled = !sub?.active && (sub?.price ?? 0) > 0;
          const isInsufficientFunds = sub?.hasInsufficientFunds ?? false;
          const isExpired = sub?.expired ?? false;

          const statusParts: string[] = [];
          if (isPaymentCancelled) {
            statusParts.push(translate(resources.renewalCanceledText));
          }
          if (isInsufficientFunds) {
            statusParts.push(translate(resources.insufficientFunds));
          }
          if (isServerInactive && statusParts.length === 0) {
            statusParts.push(translate(resources.inactiveServerText));
          }

          const statusText =
            statusParts.length > 0
              ? statusParts.join(" · ")
              : translate(resources.playerCountText, {
                  currentPlayers: server.playing || server.players?.length || 0,
                  maximumAllowedPlayers: server.maxPlayers || 0,
                });

          return (
            <ServerListItem
              key={server.vipServerId}
              name={
                server.name ||
                translate(resources.ownersServerText, { displayName: server.owner?.displayName })
              }
              playerCountStatus={statusText}
              thumbnailTargetId={server.owner?.id ?? null}
              thumbnailType={ThumbnailTypes.avatarHeadshot}
              onJoinClick={getJoinScript(
                placeId,
                { instanceId: server.id ?? null, accessCode: server.accessCode ?? "" },
                serverListTypes.Vip.key,
                server.players,
                isOwner,
                universeId,
              )}
              isJoinDisabled={
                isBusy ||
                isServerInactive ||
                isExpired ||
                (!!joinRestricted && (server.playing || server.players?.length || 0) === 0)
              }
              vipServerId={server.vipServerId}
              universeId={universeId}
              isOwner={isOwner}
              showEditIcon
              joinLabel={translate(resources.joinServerText)}
              buttonVariant="SoftEmphasis"
              isWebview={isWebview}
            />
          );
        })}

        {hasNext && (
          <div className="padding-top-medium">
            <Button
              variant="Standard"
              size="Small"
              onClick={() => loadMoreServers()}
              isDisabled={isBusy}
            >
              {translate(resources.loadMoreButtonText)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateServersSection;
