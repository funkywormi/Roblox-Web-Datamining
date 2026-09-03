import { DeviceMeta, Endpoints, GameLauncher, JsClientDeviceIdentifier } from 'Roblox';
import { uuidService } from 'core-utilities';

type JsClientDeviceIdentifierWithIE11 = typeof JsClientDeviceIdentifier & {
  isIE11?: boolean;
};

const PUBLIC_SERVER_JOIN_ORIGIN = 'publicServerListJoin';

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
};

const buildGamesStartUrl = (
  placeId: number,
  instanceId: string,
  joinAttemptId?: string
): string => {
  const queryString = buildQueryString({
    placeId,
    gameInstanceId: instanceId,
    joinAttemptId,
    joinAttemptOrigin: joinAttemptId ? PUBLIC_SERVER_JOIN_ORIGIN : undefined
  });

  return `/games/start?${queryString}`;
};

const buildMobileDeepLink = (
  placeId: number,
  instanceId: string,
  joinAttemptId?: string
): string => {
  const queryString = buildQueryString({
    gameInstanceId: instanceId,
    joinAttemptId,
    joinAttemptOrigin: joinAttemptId ? PUBLIC_SERVER_JOIN_ORIGIN : undefined
  });

  return `robloxmobile://placeID=${placeId}${queryString ? `&${queryString}` : ''}`;
};

export const shouldUseGameLaunchInterface = (): boolean => {
  const deviceMeta = DeviceMeta?.();
  const deviceType = deviceMeta?.deviceType;
  const isUWPApp = deviceMeta?.isUWPApp ?? false;
  const isChromeOs = deviceMeta?.isChromeOs ?? false;
  const isIE11 =
    (JsClientDeviceIdentifier as JsClientDeviceIdentifierWithIE11 | undefined)?.isIE11 ?? false;

  return (
    (deviceType === 'computer' && !isUWPApp && !isChromeOs) ||
    (deviceType === 'tablet' && isIE11) ||
    isUWPApp
  );
};

export const joinPublicServer = (placeId: number, instanceId: string): void => {
  const joinAttemptId = GameLauncher?.isJoinAttemptIdEnabled?.()
    ? uuidService.generateRandomUuid()
    : undefined;

  if (shouldUseGameLaunchInterface()) {
    if (GameLauncher?.joinGameInstance) {
      GameLauncher.joinGameInstance(
        placeId,
        instanceId,
        false,
        false,
        joinAttemptId,
        joinAttemptId ? PUBLIC_SERVER_JOIN_ORIGIN : undefined
      );
      return;
    }

    window.location.assign(
      Endpoints.getAbsoluteUrl(buildGamesStartUrl(placeId, instanceId, joinAttemptId))
    );
    return;
  }

  const isInApp = DeviceMeta?.()?.isInApp ?? false;
  const destinationUrl = isInApp
    ? buildGamesStartUrl(placeId, instanceId, joinAttemptId)
    : buildMobileDeepLink(placeId, instanceId, joinAttemptId);

  window.location.assign(destinationUrl);
};

export { PUBLIC_SERVER_JOIN_ORIGIN, buildGamesStartUrl, buildMobileDeepLink };
