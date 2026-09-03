import { useEffect, useState } from "react";
import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "./useProfileJsonComponent";
import { buildAssetDeliveryUrl, resolveAvatarBackgroundWrapper } from "../utils/avatarBackground";

/**
 * Resolves the equipped ProfileBackground to a renderable image URL.
 *
 * Flow: read the ProfileBackground component's wrapper `assetId` → fetch and
 * parse that wrapper rbxmx for its inner ImageId (via
 * `resolveAvatarBackgroundWrapper`) → build an assetdelivery URL for the inner
 * image. Returns null until resolved, or if no background is equipped.
 */
const useAvatarBackgroundImageUrl = (): string | null => {
  const rawComponent = useProfileJsonComponent(Component.ProfileBackground);
  // `assetId` comes from a hand-declared augment over untyped JSON, so it's
  // `unknown` at runtime; coerce to a positive number (else treat as absent).
  const assetId = rawComponent?.assetId;
  const wrapperAssetId = typeof assetId === "number" && assetId > 0 ? assetId : null;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (wrapperAssetId === null) {
      setUrl(null);
      return undefined;
    }
    // Cancellation guard: drop a late wrapper fetch if deps change or we unmount.
    let cancelled = false;
    resolveAvatarBackgroundWrapper(wrapperAssetId)
      .then(innerAssetId => {
        const nextUrl = innerAssetId !== null ? buildAssetDeliveryUrl(innerAssetId) : null;
        if (!cancelled) setUrl(nextUrl);
      })
      .catch((err: unknown) => {
        console.error("Error resolving avatar background image url:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [wrapperAssetId]);
  return url;
};

export default useAvatarBackgroundImageUrl;
