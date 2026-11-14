import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useNavCapability } from "./navCapabilities";

export const toSameOriginPath = (url: string): string => {
  const root = getAbsoluteUrl("/");
  return url.startsWith(root) ? url.slice(root.length - 1) : url;
};

export const useNavHref = (): ((url: string) => string) => {
  const toNavHref = useNavCapability("toNavHref");
  return url => toNavHref?.(url) ?? url;
};
