import React, { useMemo, useState } from "react";
import { EventContext } from "@rbx/unified-logging";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { getDeviceMeta, isIos13Ipad } from "@rbx/core-scripts/meta/device";
import {
  getJoindata,
  PlayOnWebVariant,
  usePlayabilityStatus,
  usePlayOnWeb,
  useWasmJoinId,
  wasmRedirectDialogClickEventContext,
} from "@rbx/game-play-button";
import { EventStreamMetadata } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import metadataConstants from "../constants/metadataConstants";
import { DeviceCheck, useDeviceCheck } from "../hooks/useDeviceCheck";
import { usePlayOnWebVariant } from "../hooks/usePlayOnWebVariant";
import DesktopWasmRedirect from "./DesktopWasmRedirect";
import MobileWasmRedirect from "./MobileWasmRedirect";

const WasmRedirectFlow = (): React.JSX.Element | null => {
  const {
    placeId = "",
    rootPlaceId = "",
    universeId = "",
  } = metadataConstants.metadataData() || {};
  // Read on the first render: the Play button's referral tracking then removes eventId from the URL.
  const [joinData] = useState(() => getJoindata());
  // From the URL: /games/start leaves the page metadata's private server and game instance empty.
  const [{ privateServerLinkCode, gameInstanceId }] = useState(() => {
    const params = new URLSearchParams(browserWindow?.location.search);
    return {
      privateServerLinkCode: params.get("privateServerLinkCode") ?? "",
      gameInstanceId: params.get("gameInstanceId") ?? "",
    };
  });
  const {
    isIosDevice = false,
    isAndroidDevice = false,
    isChromeOs = false,
  } = getDeviceMeta() ?? {};
  // Same split as launchGame, whose protocol launch and install dialog the desktop flow relies on.
  // Phones, tablets (including iPads that report as Macs) and ChromeOS launch through AppsFlyer.
  const isDesktop = !(isIosDevice || isAndroidDevice || isIos13Ipad() || isChromeOs);
  const eventProperties = useMemo(
    () => ({
      [EventStreamMetadata.PlaceId]: placeId,
      [EventStreamMetadata.UniverseId]: universeId,
      [EventStreamMetadata.PlayContext]: PageContext.GameDetailPage,
    }),
    [placeId, universeId],
  );
  // Unlike the EDP's Play button, waits for the device check, which probes when nothing is stored.
  const deviceCheck = useDeviceCheck();
  // OneButton and TwoButton both offer Play on Web on the EDP.
  const { playOnWebVariant, isLoading: isVariantLoading } = usePlayOnWebVariant(
    universeId,
    true,
    deviceCheck === DeviceCheck.Eligible,
  );
  const playOnWebEnabled = playOnWebVariant !== PlayOnWebVariant.None;
  const { wasmJoinId, isLoading: isJoinIdLoading } = useWasmJoinId();
  // The variant's isLoading only covers the IXP layer, so playability is checked here too.
  const { playabilityStatus } = usePlayabilityStatus(universeId);
  // Opens the WASM link, after the playable UX treatment's modal if there is one.
  const { playOnWeb: openPlayOnWebWithTreatment, playableUxTreatmentModal } = usePlayOnWeb(
    {
      placeId,
      rootPlaceId,
      universeId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      wasmJoinId,
      joinData,
      eventContext: wasmRedirectDialogClickEventContext,
    },
    EventContext.GameDetail,
  );
  // Offered once Play on Web is enabled and the user's join id is known.
  const playOnWeb = playOnWebEnabled && wasmJoinId != null ? openPlayOnWebWithTreatment : undefined;
  // Play on Web can still become available while any of these is loading. A device that fails the
  // check doesn't wait for the rest, so a stalled request can't keep it checking.
  const isCheckingPlayOnWeb =
    deviceCheck === DeviceCheck.Checking ||
    (deviceCheck === DeviceCheck.Eligible &&
      (isVariantLoading || playabilityStatus === undefined || isJoinIdLoading));

  if (isDesktop) {
    return (
      <React.Fragment>
        <DesktopWasmRedirect
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          universeId={universeId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          joinData={joinData}
          playOnWeb={playOnWeb}
        />
        {playableUxTreatmentModal}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <MobileWasmRedirect playOnWeb={playOnWeb} isCheckingPlayOnWeb={isCheckingPlayOnWeb} />
      {playableUxTreatmentModal}
    </React.Fragment>
  );
};

/**
 * Handles a /games/start visit from a WASM link (`wasmRedirect=1`), which game-details-web-subsite
 * renders without its auto-join script, and renders nothing otherwise:
 * - Desktop: launches the app like the Play button, and offers Play on Web if it doesn't start.
 * - Mobile: offers Play on Web in a dialog, without trying the app.
 * Where Play on Web isn't available, the page stays as the EDP, whose Play button launches the
 * game.
 */
const WasmRedirect = (): React.JSX.Element | null => {
  const { isWasmRedirect = false } = metadataConstants.metadataData() || {};
  // Only WASM link visits check Play on Web here, so other EDP visits don't log its exposure twice.
  return isWasmRedirect ? <WasmRedirectFlow /> : null;
};

export default WasmRedirect;
