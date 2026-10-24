import environmentUrls from "@rbx/environment-urls";

export type ParamValue = string | number | boolean | null | undefined;
export type Params = Readonly<Record<string, ParamValue>>;

export type PlaceLauncherRequest =
  | "RequestGame"
  | "RequestFollowUser"
  | "RequestGameJob"
  | "RequestPrivateGame"
  | "RequestPlayTogetherGame";

export type LaunchMode = "play" | "edit" | "asset" | "plugin";

export const isStudioLaunchMode = (launchMode: LaunchMode): boolean => launchMode !== "play";

export type GameLaunchParams = {
  protocolName: string;
  launchMode: LaunchMode;
  otherParams: Record<string, ParamValue>;
  launchTime?: number;
  placeId?: ParamValue;
  isPlayTogetherGame?: boolean;
  launchData?: ParamValue;
  eventId?: ParamValue;
  conversationId?: ParamValue;
};

const sitetestDomains = [
  "sitetest1.robloxlabs.com",
  "sitetest2.robloxlabs.com",
  "sitetest3.robloxlabs.com",
];

export const getProtocolNameForEnvironment = (
  protocolName: string,
  domain: string = environmentUrls.domain,
): string =>
  sitetestDomains.includes(domain) ? `${protocolName}-${domain.split(".")[0]}` : protocolName;

// Byte-for-byte jQuery 1.12 `$.param` for flat objects, which the client parses.
export const encodeParams = (params: Params): string =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? "")}`)
    .join("&")
    .replace(/%20/g, "+");

// Drops undefined but keeps null, as the legacy `$.extend` merge did.
export const buildPlaceLauncherUrl = (
  placeLauncherUrl: string,
  request: PlaceLauncherRequest,
  browserTrackerId: string | false,
  params: Params,
): string =>
  `${placeLauncherUrl}?${encodeParams({
    request,
    browserTrackerId,
    ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
  })}`;

// Studio launches add the signed-in user and the browser, unencoded as in the legacy URL.
export type StudioUrlParams = { userId: number | string | null; browser: string };

export const buildProtocolUrl = (
  params: GameLaunchParams,
  authTicket?: string,
  studio?: StudioUrlParams,
): string => {
  const components = ["1", `launchmode:${params.launchMode}`];
  if (authTicket) {
    components.push(`gameinfo:${encodeURIComponent(authTicket)}`);
  }
  components.push(`launchtime:${String(params.launchTime)}`);
  if (studio) {
    if (studio.userId != null) {
      components.push("distributorType:Global", `userId:${String(studio.userId)}`);
    }
    components.push(`browser:${studio.browser}`);
  }
  Object.entries(params.otherParams).forEach(([name, value]) => {
    components.push(name === value ? name : `${name}:${encodeURIComponent(String(value))}`);
  });
  return `${params.protocolName}:${components.join("+")}`;
};
