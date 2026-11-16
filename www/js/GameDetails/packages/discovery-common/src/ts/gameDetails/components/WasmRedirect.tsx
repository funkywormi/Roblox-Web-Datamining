import React, { useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { getDeviceMeta, isIos13Ipad } from "@rbx/core-scripts/meta/device";
import { getJoindata, openPlayOnWeb, PlayOnWebVariant, useWasmJoinId } from "@rbx/game-play-button";
import metadataConstants from "../constants/metadataConstants";
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
  // OneButton and TwoButton both offer Play on Web on the EDP.
  const playOnWebEnabled = usePlayOnWebVariant(universeId) !== PlayOnWebVariant.None;
  const { wasmJoinId } = useWasmJoinId();
  // Opens the WASM link, once Play on Web is enabled and the user's join id is known.
  const playOnWeb =
    playOnWebEnabled && wasmJoinId != null
      ? () =>
          openPlayOnWeb({
            placeId,
            rootPlaceId,
            universeId,
            privateServerLinkCode,
            gameInstanceId,
            wasmJoinId,
            joinData,
          })
      : undefined;

  if (isDesktop) {
    return (
      <DesktopWasmRedirect
        placeId={placeId}
        rootPlaceId={rootPlaceId}
        universeId={universeId}
        privateServerLinkCode={privateServerLinkCode}
        gameInstanceId={gameInstanceId}
        joinData={joinData}
        playOnWeb={playOnWeb}
      />
    );
  }

  return <MobileWasmRedirect playOnWeb={playOnWeb} />;
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
