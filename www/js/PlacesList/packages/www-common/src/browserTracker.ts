// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- types only, so consumers see the tracker cookie registry entries
/// <reference path="./global.ts" />
import { get } from "@rbx/core-lib/cookie";

/** Next.js-safe `Roblox.Cookies.getBrowserTrackerId`: `browserid` from `RBXEventTrackerV2`, or `false`. */
export const getBrowserTrackerId = (): string | false =>
  get("RBXEventTrackerV2")?.value.match(/browserid=([^&]*)/i)?.[1] ?? false;

/** Next.js-safe `Roblox.Cookies.getSessionId`: `sessionid` from `RBXSessionTracker`, or `false`. */
export const getSessionId = (): string | false =>
  get("RBXSessionTracker")?.value.match(/sessionid=([^&]*)/i)?.[1] ?? false;

/** Next.js-safe `Roblox.Cookies.getGuestId`: `userid` from `GuestData`, or `false`. */
export const getGuestId = (): string | false =>
  get("GuestData")?.value.match(/userid=([^&]*)/i)?.[1] ?? false;
