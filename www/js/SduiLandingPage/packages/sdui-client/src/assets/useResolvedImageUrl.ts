"use client";

import { useState, useEffect } from "react";
import { resolveAssetImageUrl, resolveSingleAssetImageUrl } from "./assetImageBatchResolver";

export type ImageResolveStatus = "idle" | "loading" | "resolved" | "error";

export interface ResolvedImage {
  src: string | null;
  status: ImageResolveStatus;
}

function getInitialState(assetId: string | undefined): ResolvedImage {
  return assetId ? { src: null, status: "loading" } : { src: null, status: "idle" };
}

/**
 * Resolves an `rbxassetid://...` asset id into a CDN URL.
 * Thumbnail images do not use this hook; `Thumbnail2d` owns that request path.
 */
export function useResolvedImageUrl(
  assetId: string | undefined,
  useSingleAssetApi = false,
): ResolvedImage {
  const [state, setState] = useState<ResolvedImage>(() => getInitialState(assetId));

  useEffect(() => {
    if (!assetId) {
      setState({ src: null, status: "idle" });
      return undefined;
    }

    setState({ src: null, status: "loading" });
    let cancelled = false;

    const resolveImageUrl = useSingleAssetApi ? resolveSingleAssetImageUrl : resolveAssetImageUrl;

    resolveImageUrl(assetId)
      .then(src => {
        if (cancelled) return;

        setState(src ? { src, status: "resolved" } : { src: null, status: "error" });
      })
      .catch(() => {
        if (!cancelled) setState({ src: null, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [assetId, useSingleAssetApi]);

  return state;
}
