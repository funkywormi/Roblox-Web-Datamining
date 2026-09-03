/** Thin shim over the `Roblox.CommunityTelemetry` global; id minting lives in @rbx/community-telemetry. */
import { useRef } from 'react';
import getCommunityTelemetry from './communityTelemetryGlobal';

export const mintEntrypointImpressionId = (): string =>
  getCommunityTelemetry().mintEntrypointImpressionId();

export const mintSearchId = (): string => getCommunityTelemetry().mintSearchId();

// Implemented locally (NOT delegated to the global's hook) so `useRef` is always called
// unconditionally — the hook count stays stable even if the CommunityTelemetry global loads
// mid-lifecycle. Retries while empty so an id minted during the absent window resolves once the
// SCC loads, then stays stable for the rendered component instance.
export const useEntrypointImpressionId = (): string => {
  const idRef = useRef<string>('');
  if (!idRef.current) {
    idRef.current = mintEntrypointImpressionId();
  }
  return idRef.current;
};
