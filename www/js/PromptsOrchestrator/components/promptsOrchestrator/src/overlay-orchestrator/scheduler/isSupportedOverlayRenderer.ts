import { OverlayRenderer } from "../types";

const supportedRenderers = new Set<string>(Object.values(OverlayRenderer));

export const isSupportedOverlayRenderer = (renderer: string): renderer is OverlayRenderer =>
  supportedRenderers.has(renderer);
