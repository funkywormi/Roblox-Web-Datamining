// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- types only, so consumers see the RBXEventTrackerV2 registry entry
/// <reference path="./global.d.ts" />
import { get } from "@rbx/core-lib/cookie";

/** Next.js-safe `Roblox.Cookies.getBrowserTrackerId`: `browserid` from `RBXEventTrackerV2`, or `false`. */
export const getBrowserTrackerId = (): string | false =>
  get("RBXEventTrackerV2")?.value.match(/browserid=([^&]*)/i)?.[1] ?? false;
