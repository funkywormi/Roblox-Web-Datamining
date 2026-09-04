import React from "react";
import robloxLogoTextDark from "@rbx/branding-assets/images/logos/roblox_logo_text_dark.svg";
import robloxLogoTextLight from "@rbx/branding-assets/images/logos/roblox_logo_text_light.svg";
import type { SduiRendererInjectedProps } from "../types";

const DEFAULT_WIDTH_PX = 98;
const DEFAULT_LOGO_NAME = "robloxWordmark";

interface LogoAssetPair {
  light: string;
  dark: string;
}

const DEFAULT_LOGO_ASSET: LogoAssetPair = {
  light: robloxLogoTextLight,
  dark: robloxLogoTextDark,
};

// Client-bundled asset registry keyed by template `name` strings. Adding a new
// logo only requires an entry here — no schema or prop-parser changes.
const LOGO_ASSETS: Record<string, LogoAssetPair> = {
  robloxWordmark: DEFAULT_LOGO_ASSET,
};

export interface SduiLogoProps extends SduiRendererInjectedProps {
  name?: string;
  width?: number;
}

/**
 * Renders a client-bundled static logo/wordmark, selected by `name`. Swaps
 * light/dark variants with site theme; theme handling is opaque to the schema
 * and owned entirely by this component.
 */
export function SduiLogo({ name, width }: SduiLogoProps) {
  const resolvedWidth = width ?? DEFAULT_WIDTH_PX;
  const asset = LOGO_ASSETS[name ?? DEFAULT_LOGO_NAME] ?? DEFAULT_LOGO_ASSET;

  return (
    <React.Fragment>
      <img
        src={asset.light}
        alt="Roblox"
        className="dark:hidden"
        width={resolvedWidth}
        style={{ width: resolvedWidth }}
      />
      <img
        src={asset.dark}
        alt="Roblox"
        className="hidden dark:block"
        width={resolvedWidth}
        style={{ width: resolvedWidth }}
      />
    </React.Fragment>
  );
}
