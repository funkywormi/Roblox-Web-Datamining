// TODO: Hybrid currently will not work on NextJS because the global window.Roblox is not defined
// and a NextJS equivalent will need to be added for any challenges that have this as a dependency.

const LOG_PREFIX = "Hybrid Response Service: ";

type HybridNavigation = {
  navigateToFeature: (params: Record<string, unknown>, callback?: () => void) => void;
};

const getHybridNavigation = (): HybridNavigation | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- native app bridge injected on window.Roblox, absent on regular web
  const { Roblox } = window as { Roblox?: { Hybrid?: { Navigation?: HybridNavigation } } };
  return Roblox?.Hybrid?.Navigation;
};

/* eslint-disable @typescript-eslint/naming-convention -- member names are an existing API contract; values mirror the native bridge's feature keys. */
export enum FeatureTarget {
  GET_CREDENTIALS = "getCredentials",
  REGISTER_CREDENTIALS = "registerCredentials",
  CREDENTIALS_PROTOCOL_AVAILABLE = "credentialsProtocolAvailable",
  GET_INTEGRITY_TOKEN = "getIntegrityToken",
}
/* eslint-enable @typescript-eslint/naming-convention */

const resolveNullAfter = (timeoutMilliseconds: number) =>
  new Promise<null>(resolve => {
    setTimeout(() => {
      resolve(null);
    }, timeoutMilliseconds);
  });

const nativePromises: Record<number, Promise<string>> = {};
const nativeResolves: Record<number, (value: string) => void> = {};
let nextCallId = 0;

// Exclusively called by the Lua layer via BrowserService:ExecuteJavaScript(injectNativeResponse).
export const injectNativeResponse = (callId: number, value: unknown): void => {
  if (nativeResolves[callId] !== undefined) {
    nativeResolves[callId](String(value));
  }
};

export const getNativeResponse = (
  feature: FeatureTarget,
  parameters: Record<string, unknown>,
  timeoutMilliseconds: number,
): Promise<string | null> => {
  const navigation = getHybridNavigation();
  nextCallId += 1;
  const currentCallId = nextCallId;
  nativePromises[currentCallId] = new Promise(resolve => {
    nativeResolves[currentCallId] = (value: string) => {
      resolve(value);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete nativePromises[currentCallId];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete nativeResolves[currentCallId];
    };
  });

  if (navigation) {
    navigation.navigateToFeature(
      {
        feature,
        data: {
          callId: currentCallId,
          ...parameters,
        },
      },
      () => {
        // eslint-disable-next-line no-console
        console.log(LOG_PREFIX, "Sent native request:", feature);
      },
    );
  }
  return Promise.race([resolveNullAfter(timeoutMilliseconds), nativePromises[currentCallId]]);
};
