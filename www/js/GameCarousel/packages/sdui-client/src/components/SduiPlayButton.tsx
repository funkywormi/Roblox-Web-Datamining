"use client";

import { useEffect, useMemo, useState } from "react";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { isValidHttpUrl } from "@rbx/core-scripts/util/url";
import environmentUrls from "@rbx/environment-urls";
import { DefaultPlayButton, PlayabilityStatus, usePlayabilityStatus } from "@rbx/game-play-button";
import { Loading } from "@rbx/sdui-common";
import { findAnalyticsFieldInAncestors, type SduiRendererInjectedProps } from "@rbx/sdui-core";
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
}

function normalizeId(value: string | number | undefined): string | undefined {
  if (value == null) return undefined;

  const normalized = String(value).trim();
  return /^[1-9]\d*$/.test(normalized) ? normalized : undefined;
}

function SduiPlayButtonContents({
  universeId,
  placeId,
  rootPlaceId,
  includeRootPlaceId,
  analyticsContext,
}: {
  universeId: string;
  placeId: string;
  rootPlaceId: string;
  includeRootPlaceId: boolean;
  analyticsContext?: SduiPlayButtonProps["analyticsContext"];
}) {
  const { pageContext } = useSduiServices();
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

  const playButtonPageContext = getSduiEventContext(pageContext);

  const eventProperties = useMemo(() => {
    const adFlag = findAnalyticsFieldInAncestors("adFlag", analyticsContext);

    return {
      universeId,
      placeId,
      ...(includeRootPlaceId ? { rootPlaceId } : {}),
      ...(adFlag != null ? { isAd: String(adFlag) } : {}),
      playContext: pageContext.pageName,
    };
  }, [
    analyticsContext,
    includeRootPlaceId,
    pageContext.pageName,
    placeId,
    rootPlaceId,
    universeId,
  ]);

  if (shouldShowVpcPlayButtonUpsells === undefined) {
    return <Loading />;
  }

  const isPurchaseRequired =
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired;
  const purchaseUrl = `${environmentUrls.websiteUrl}/games/${placeId}`;

  return (
    <DefaultPlayButton
      placeId={placeId}
      rootPlaceId={rootPlaceId}
      universeId={universeId}
      refetchPlayabilityStatus={refetchPlayabilityData}
      playabilityStatus={playabilityStatus}
      eventProperties={eventProperties}
      buttonClassName={
        isPurchaseRequired ? "btn-economy-robux-white-lg purchase-button" : undefined
      }
      hideButtonText={!isPurchaseRequired}
      redirectPurchaseUrl={
        isPurchaseRequired && isValidHttpUrl(purchaseUrl) ? purchaseUrl : undefined
      }
      showDefaultPurchaseText={playabilityStatus === PlayabilityStatus.FiatPurchaseRequired}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
      demoModeAvailable={demoModeAvailable}
      pageContext={playButtonPageContext}
    />
  );
}

export function SduiPlayButton({
  universeId,
  placeId,
  rootPlaceId,
  analyticsContext,
}: SduiPlayButtonProps) {
  const normalizedUniverseId = normalizeId(universeId);
  const normalizedPlaceId = normalizeId(placeId);
  const normalizedRootPlaceId = normalizeId(rootPlaceId);

  if (normalizedUniverseId == null || normalizedPlaceId == null) return null;

  return (
    <div className="sdui-play-button">
      <SduiPlayButtonContents
        universeId={normalizedUniverseId}
        placeId={normalizedPlaceId}
        rootPlaceId={normalizedRootPlaceId ?? normalizedPlaceId}
        includeRootPlaceId={normalizedRootPlaceId != null}
        analyticsContext={analyticsContext}
      />
    </div>
  );
}
