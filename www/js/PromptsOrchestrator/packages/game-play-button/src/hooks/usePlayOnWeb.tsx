import type React from "react";
import { useCallback } from "react";
import { openPlayOnWeb, type TOpenPlayOnWebParams } from "../utils/openPlayOnWeb";
import useLaunchGameWithPlayableUxTreatment from "./useLaunchGameWithPlayableUxTreatment";
import type { TPlayButtonPageContext } from "../types/playButtonTypes";

/**
 * Returns play on web along with the treatment modal to use if it exists.
 * The caller needs to display the treatment modal.
 */
const usePlayOnWeb = (
  {
    placeId,
    rootPlaceId,
    universeId,
    privateServerLinkCode,
    gameInstanceId,
    eventProperties,
    wasmJoinId,
    joinData,
    eventContext,
  }: TOpenPlayOnWebParams,
  pageContext: TPlayButtonPageContext,
): { playOnWeb: () => void; playableUxTreatmentModal: React.ReactNode } => {
  const doGameLaunch = useCallback(() => {
    openPlayOnWeb({
      placeId,
      rootPlaceId,
      universeId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      wasmJoinId,
      joinData,
      eventContext,
    });
  }, [
    placeId,
    rootPlaceId,
    universeId,
    privateServerLinkCode,
    gameInstanceId,
    eventProperties,
    wasmJoinId,
    joinData,
    eventContext,
  ]);

  const { doGameLaunchWithPlayableUxTreatment, playableUxTreatmentModal } =
    useLaunchGameWithPlayableUxTreatment(universeId, doGameLaunch, pageContext);

  return { playOnWeb: doGameLaunchWithPlayableUxTreatment, playableUxTreatmentModal };
};

export default usePlayOnWeb;
