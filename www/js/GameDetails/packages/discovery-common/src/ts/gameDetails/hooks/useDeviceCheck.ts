import { useQuery } from "@tanstack/react-query";
import {
  isSupportedBrowserAndDevice,
  meetsRequiredSpec,
  setBrowserGate,
  setDeviceProbeConfig,
} from "@rbx/device-probe/client";
import { onSupportedBrowserAndDevice, useStoredAnswer } from "./usePlayOnWebVariant";

export const DeviceCheck = {
  Checking: "checking",
  Eligible: "eligible",
  Ineligible: "ineligible",
} as const;

export type TDeviceCheck = (typeof DeviceCheck)[keyof typeof DeviceCheck];

/**
 * Whether this device meets the Play on Web spec, live: `checking` while the probe runs, then
 * `eligible` or `ineligible`. For UI that waits on the answer: `WasmRedirect`, whose mobile
 * "checking your device" dialog stays up until it answers. With nothing stored it asks the probe.
 * Doesn't change the Play on Web button, which only uses the answer stored at load.
 */
export const useDeviceCheck = (): TDeviceCheck => {
  const storedAnswer = useStoredAnswer();
  // One query per page, so every caller shares a run. Never rejects: a timeout or error resolves
  // false.
  const { data: probedAnswer } = useQuery({
    queryKey: ["deviceProbe/meetsRequiredSpec"],
    queryFn: () => {
      // On .NET pages this bundle has its own copy of the client, which the site-wide runner in
      // core scripts doesn't set up, so it's set up here the same way. The Web Lock and the cache
      // read inside it mean the two copies don't both benchmark.
      setBrowserGate(isSupportedBrowserAndDevice);
      setDeviceProbeConfig({ enabled: true });
      return meetsRequiredSpec();
    },
    enabled: onSupportedBrowserAndDevice && storedAnswer === null,
    staleTime: Infinity,
  });

  if (!onSupportedBrowserAndDevice) {
    return DeviceCheck.Ineligible;
  }
  const answer = storedAnswer ?? probedAnswer;
  if (answer === undefined) {
    return DeviceCheck.Checking;
  }
  return answer ? DeviceCheck.Eligible : DeviceCheck.Ineligible;
};
