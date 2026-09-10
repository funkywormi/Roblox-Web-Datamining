import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import { createRestrictionRequestFromRealtime } from "../shared/utils/createRestrictionRequestFromRealtime";
import type {
  FeatureRestrictionRequest,
  ShowFeatureRestrictionFromRealtimeOptions,
  ShowFeatureRestrictionOptions,
} from "../types/runtimeOptions";

/**
 * Props supplied by the provider to the host-owned dialog surface.
 */
export interface UniversalFeatureRestrictionsSurfaceProps {
  request: FeatureRestrictionRequest;
  open: boolean;
  onDismiss: () => void;
}

/**
 * Imperative controls returned by {@link useUniversalFeatureRestrictions}.
 */
export interface UniversalFeatureRestrictionsControls {
  showFeatureRestriction: (options: ShowFeatureRestrictionOptions) => void;
  showFeatureRestrictionFromRealtime: (options: ShowFeatureRestrictionFromRealtimeOptions) => void;
  closeFeatureRestriction: () => void;
}

/**
 * Holds the imperative show/close controls for the whole application. Owned by
 * {@link UniversalFeatureRestrictionsProvider} and consumed via {@link useUniversalFeatureRestrictions}.
 * Lives for the lifetime of the host app, independent of whether the deferred dialog surface has
 * mounted yet.
 */
const UniversalFeatureRestrictionsContext = createContext<
  UniversalFeatureRestrictionsControls | undefined
>(undefined);

type Props = PropsWithChildren<{
  /** Host-provided dialog surface - used to lazy load the dialog content on Creator Hub. */
  Surface: ComponentType<UniversalFeatureRestrictionsSurfaceProps>;
}>;

interface ActiveRestrictionState {
  /** Most recent restriction request, retained while the surface is closed. */
  request?: FeatureRestrictionRequest;
  /** Whether the host-owned restriction surface should be open. */
  open: boolean;
  /**
   * Alternates the Surface's React key so request-scoped state, analytics effects, interaction
   * timers, and cached moderation data do not carry over to a new presentation.
   */
  presentationToggle: boolean;
  /** Identifies the currently open realtime intervention so duplicate deliveries do not remount. */
  realtimeIdentity?: string;
}

/**
 * High-level controls entry point. Exposes imperative show/close controls (via
 * {@link useUniversalFeatureRestrictions}) to descendants and renders the host-provided surface
 * only after the first request.
 */
export const UniversalFeatureRestrictionsProvider = ({ Surface, children }: Props) => {
  const [{ request, open, presentationToggle }, setActiveRestriction] =
    useState<ActiveRestrictionState>({
      open: false,
      presentationToggle: false,
    });

  const showFeatureRestriction = useCallback((options: ShowFeatureRestrictionOptions) => {
    setActiveRestriction(current => ({
      request: options,
      open: true,
      presentationToggle: !current.presentationToggle,
    }));
  }, []);

  const showFeatureRestrictionFromRealtime = useCallback(
    (options: ShowFeatureRestrictionFromRealtimeOptions) => {
      const request = createRestrictionRequestFromRealtime(options);

      const { intervention } = options;
      const realtimeIdentity = intervention.decisionEventId
        ? `${intervention.type}:${intervention.decisionEventId}`
        : undefined;

      setActiveRestriction(current => {
        const isDuplicate =
          current.open && realtimeIdentity && current.realtimeIdentity === realtimeIdentity;

        return {
          request,
          open: true,
          presentationToggle: isDuplicate
            ? current.presentationToggle
            : !current.presentationToggle,
          realtimeIdentity,
        };
      });
    },
    [],
  );

  const closeFeatureRestriction = useCallback(() => {
    setActiveRestriction(current => ({ ...current, open: false }));
  }, []);

  const controls = useMemo<UniversalFeatureRestrictionsControls>(
    () => ({
      showFeatureRestriction,
      showFeatureRestrictionFromRealtime,
      closeFeatureRestriction,
    }),
    [showFeatureRestriction, showFeatureRestrictionFromRealtime, closeFeatureRestriction],
  );

  return (
    <UniversalFeatureRestrictionsContext.Provider value={controls}>
      {children}
      {/* The first request loads the deferred surface; each new presentation remounts it. */}
      {request && (
        <Surface
          key={presentationToggle ? 1 : 0}
          request={request}
          open={open}
          onDismiss={closeFeatureRestriction}
        />
      )}
    </UniversalFeatureRestrictionsContext.Provider>
  );
};

export const useUniversalFeatureRestrictions = (): UniversalFeatureRestrictionsControls => {
  const controls = useContext(UniversalFeatureRestrictionsContext);

  if (!controls) {
    throw new Error(
      "useUniversalFeatureRestrictions must be used within a UniversalFeatureRestrictionsProvider",
    );
  }

  return controls;
};
