"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { isValidHttpUrl } from "@rbx/core-scripts/util/url";
import environmentUrls from "@rbx/environment-urls";
import {
  DefaultPlayButton,
  PlayabilityStatus,
  PlayButton,
  shouldShowUnplayableButton,
  usePlayabilityStatus,
} from "@rbx/game-play-button";
import { Loading } from "@rbx/sdui-common";
import {
  ActionType,
  buildDimCss,
  decorateAnalyticsPayloadWithSessionData,
  findAnalyticsFieldInAncestors,
  getZeroBasedPosition,
  reportActionAnalytics,
  SDUI_SESSION_KEYS,
  type AnalyticsContext,
  type SduiDim,
  type SduiPageContext,
  type SduiRendererInjectedProps,
  type SduiSessionData,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { getSduiEventContext } from "../utils/getSduiEventContext";
import "./css/sduiPlayButton.css";

// TODO: Move app-policy fetching into a shared hook so SDUI and
// non-SDUI play buttons do not duplicate this request and response type.
interface AppPolicyResponse {
  shouldShowVpcPlayButtonUpsells?: boolean;
}

export interface SduiPlayButtonProps extends SduiRendererInjectedProps {
  universeId?: string | number;
  placeId?: string | number;
  rootPlaceId?: string | number;
  width?: SduiDim | number;
  playableText?: string;
  hidePlayableIcon?: boolean;
  hideIfLoading?: boolean;
  hideIfUnplayable?: boolean;
}

function normalizeId(value: string | number | undefined): string | undefined {
  if (value == null) return undefined;

  const normalized = String(value).trim();
  return /^[1-9]\d*$/.test(normalized) ? normalized : undefined;
}

function parseOptionalInteger(value: string | number | boolean | undefined): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

// Same accepted values as discovery-common `parseBooleanField`.
function isAdFlagSet(value: string | number | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "t";
  }
  return false;
}

function parseCollectionIdField(
  value: string | number | boolean | undefined,
): string | number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return undefined;
}

// Recomputed per render rather than memoized on analyticsContext identity
// because snapshots update in place on signal refresh.
function buildPlayButtonEventProperties({
  universeId,
  placeId,
  rootPlaceId,
  includeRootPlaceId,
  analyticsContext,
  pageContext,
  sessionData,
}: {
  universeId: string;
  placeId: string;
  rootPlaceId: string;
  includeRootPlaceId: boolean;
  analyticsContext?: AnalyticsContext;
  pageContext: SduiPageContext;
  sessionData: SduiSessionData;
}): Record<string, string | number> {
  const collectionData = analyticsContext?.getCollectionData?.();
  const adFlag = findAnalyticsFieldInAncestors("adFlag", analyticsContext);
  const nativeAdData = findAnalyticsFieldInAncestors("nativeAdData", analyticsContext);
  const adId =
    nativeAdData != null && nativeAdData !== ""
      ? nativeAdData
      : findAnalyticsFieldInAncestors("adId", analyticsContext);
  const heroUnitId = findAnalyticsFieldInAncestors("heroUnitId", analyticsContext);
  const itemPosition = parseOptionalInteger(
    findAnalyticsFieldInAncestors("itemPosition", analyticsContext),
  );
  const collectionPosition = parseOptionalInteger(
    collectionData?.collectionPosition ??
      findAnalyticsFieldInAncestors("collectionPosition", analyticsContext),
  );
  const collectionId = parseCollectionIdField(
    collectionData?.collectionId ?? findAnalyticsFieldInAncestors("collectionId", analyticsContext),
  );
  const totalNumberOfItems = parseOptionalInteger(
    collectionData?.totalNumberOfItems ??
      findAnalyticsFieldInAncestors("totalNumberOfItems", analyticsContext),
  );

  const hasCollectionReferralContext =
    collectionData != null ||
    collectionId !== undefined ||
    collectionPosition !== undefined ||
    itemPosition !== undefined;

  const fields: Record<string, string | number> = {
    universeId,
    placeId,
    ...(includeRootPlaceId ? { rootPlaceId } : {}),
    isAd: String(isAdFlagSet(adFlag)),
    ...(adId != null && adId !== "" ? { nativeAdData: String(adId) } : {}),
    ...(heroUnitId != null && heroUnitId !== "" ? { heroUnitId: String(heroUnitId) } : {}),
    ...(itemPosition !== undefined ? { position: getZeroBasedPosition(itemPosition) } : {}),
    ...(collectionPosition !== undefined
      ? { sortPos: getZeroBasedPosition(collectionPosition) }
      : {}),
    ...(collectionId !== undefined ? { gameSetTypeId: collectionId } : {}),
    ...(totalNumberOfItems !== undefined ? { numberOfLoadedTiles: totalNumberOfItems } : {}),
    ...(hasCollectionReferralContext ? { page: pageContext.pageName } : {}),
    playContext: pageContext.pageName,
  };

  for (const sessionKey of SDUI_SESSION_KEYS) {
    const sessionValue = findAnalyticsFieldInAncestors(sessionKey, analyticsContext);
    if (typeof sessionValue === "string" && sessionValue !== "") {
      fields[sessionKey] = sessionValue;
    }
  }

  return decorateAnalyticsPayloadWithSessionData(fields, sessionData);
}

function SduiPlayButtonContents({
  universeId,
  placeId,
  rootPlaceId,
  includeRootPlaceId,
  analyticsContext,
  width,
  playableText,
  hidePlayableIcon,
  hideIfLoading,
  hideIfUnplayable,
}: {
  universeId: string;
  placeId: string;
  rootPlaceId: string;
  includeRootPlaceId: boolean;
  analyticsContext?: SduiPlayButtonProps["analyticsContext"];
  width?: SduiDim | number;
  playableText?: string;
  hidePlayableIcon?: boolean;
  hideIfLoading?: boolean;
  hideIfUnplayable?: boolean;
}) {
  const { pageContext, sessionStore, analyticsReporter, errorReporter } = useSduiServices();
  const { playabilityStatus, demoModeAvailable, refetchPlayabilityData } =
    usePlayabilityStatus(universeId);
  // shouldShowVpcPlayButtonUpsells is undefined while fetching the app-policy
  const [shouldShowVpcPlayButtonUpsells, setShouldShowVpcPlayButtonUpsells] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    let isMounted = true;

    callBehaviour<AppPolicyResponse>("app-policy")
      .then(policy => {
        if (isMounted) {
          setShouldShowVpcPlayButtonUpsells(policy.shouldShowVpcPlayButtonUpsells === true);
        }
      })
      .catch(() => {
        if (isMounted) setShouldShowVpcPlayButtonUpsells(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayButtonActivated = useCallback(() => {
    if (!analyticsContext) return;
    reportActionAnalytics(
      { actionType: ActionType.PLAY_BUTTON_CLICK, actionParams: {} },
      analyticsContext,
      pageContext,
      analyticsReporter,
      errorReporter,
    );
  }, [analyticsContext, analyticsReporter, errorReporter, pageContext]);

  // Lua `SduiPlayButton` logs every press of an enabled CTA. The Playable and GuestProhibited
  // `PlayButton` stops propagation, so this listens in the capture phase. The loading button is
  // clickable but is not a CTA.
  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (playabilityStatus === undefined) return;
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("button, a");
      if (control == null || !event.currentTarget.contains(control)) return;
      if (control.matches(":disabled") || control.getAttribute("aria-disabled") === "true") return;
      handlePlayButtonActivated();
    },
    [handlePlayButtonActivated, playabilityStatus],
  );

  const playButtonPageContext = getSduiEventContext(pageContext);
  // Keyed by value so `PlayButton`'s launch callbacks keep their identity across re-renders.
  const latestEventProperties = buildPlayButtonEventProperties({
    universeId,
    placeId,
    rootPlaceId,
    includeRootPlaceId,
    analyticsContext,
    pageContext,
    sessionData: sessionStore.getSessionData(),
  });
  const eventPropertiesKey = JSON.stringify(latestEventProperties);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eventProperties = useMemo(() => latestEventProperties, [eventPropertiesKey]);

  const isLoading = shouldShowVpcPlayButtonUpsells === undefined || playabilityStatus === undefined;
  if (hideIfLoading && isLoading) {
    return null;
  }

  // Matches Lua `PlayButtonView`: only the unplayable state hides. Guest, paid-access, and
  // action-needed CTAs stay visible.
  if (
    hideIfUnplayable &&
    shouldShowVpcPlayButtonUpsells !== undefined &&
    shouldShowUnplayableButton(playabilityStatus, shouldShowVpcPlayButtonUpsells)
  ) {
    return null;
  }

  const widthCss = typeof width === "number" ? `${width}px` : buildDimCss(width);
  const isLabeledOrSized = (playableText != null && playableText !== "") || widthCss !== undefined;
  const containerClassName = isLabeledOrSized
    ? "sdui-play-button sdui-play-button--labeled"
    : "sdui-play-button";
  // Use minWidth (Lua SduiPlayButton parity) so labels expand instead of truncating on narrow widths.
  const containerStyle = widthCss ? { minWidth: widthCss } : undefined;

  if (shouldShowVpcPlayButtonUpsells === undefined) {
    return (
      <div className={containerClassName} style={containerStyle}>
        <Loading />
      </div>
    );
  }

  const isPurchaseRequired =
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired;
  const purchaseUrl = `${environmentUrls.websiteUrl}/games/${placeId}`;

  const renderPlayableButton = (
    status: typeof PlayabilityStatus.Playable | typeof PlayabilityStatus.GuestProhibited,
  ) => (
    <PlayButton
      universeId={universeId}
      placeId={placeId}
      rootPlaceId={rootPlaceId}
      status={status}
      eventProperties={eventProperties}
      disableLoadingState={hideIfLoading}
      buttonText={playableText}
      hideIcon={hidePlayableIcon}
      pageContext={playButtonPageContext}
    />
  );

  return (
    <div
      className={containerClassName}
      data-testid="sdui-play-button"
      style={containerStyle}
      onClickCapture={handleClickCapture}
    >
      <DefaultPlayButton
        placeId={placeId}
        rootPlaceId={rootPlaceId}
        universeId={universeId}
        refetchPlayabilityStatus={refetchPlayabilityData}
        playabilityStatus={playabilityStatus}
        eventProperties={eventProperties}
        disableLoadingState={hideIfLoading}
        buttonClassName={
          isPurchaseRequired ? "game-play-button-purchase-lg purchase-button" : undefined
        }
        hideButtonText={!isPurchaseRequired}
        redirectPurchaseUrl={
          isPurchaseRequired && isValidHttpUrl(purchaseUrl) ? purchaseUrl : undefined
        }
        showDefaultPurchaseText={playabilityStatus === PlayabilityStatus.FiatPurchaseRequired}
        shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
        demoModeAvailable={demoModeAvailable}
        pageContext={playButtonPageContext}
        playabilityStatusCtaOverrides={{
          [PlayabilityStatus.Playable]: renderPlayableButton(PlayabilityStatus.Playable),
          [PlayabilityStatus.GuestProhibited]: renderPlayableButton(
            PlayabilityStatus.GuestProhibited,
          ),
        }}
      />
    </div>
  );
}

export function SduiPlayButton({
  universeId,
  placeId,
  rootPlaceId,
  width,
  playableText,
  hidePlayableIcon,
  hideIfLoading,
  hideIfUnplayable,
  analyticsContext,
}: SduiPlayButtonProps) {
  const normalizedUniverseId = normalizeId(universeId);
  const normalizedPlaceId = normalizeId(placeId);
  const normalizedRootPlaceId = normalizeId(rootPlaceId);
  const resolvedPlaceId = normalizedPlaceId ?? normalizedRootPlaceId;

  if (normalizedUniverseId == null || resolvedPlaceId == null) return null;

  return (
    <SduiPlayButtonContents
      universeId={normalizedUniverseId}
      placeId={resolvedPlaceId}
      rootPlaceId={normalizedRootPlaceId ?? resolvedPlaceId}
      includeRootPlaceId={normalizedRootPlaceId != null}
      analyticsContext={analyticsContext}
      width={width}
      playableText={playableText}
      hidePlayableIcon={hidePlayableIcon}
      hideIfLoading={hideIfLoading}
      hideIfUnplayable={hideIfUnplayable}
    />
  );
}
