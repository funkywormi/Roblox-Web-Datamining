import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import type { ShowFeatureRestrictionOptions } from "../types/runtimeOptions";

/**
 * Props supplied by the provider to the host-owned dialog surface.
 */
export interface UniversalFeatureRestrictionsSurfaceProps {
  request: ShowFeatureRestrictionOptions;
  open: boolean;
  onDismiss: () => void;
}

/**
 * Imperative controls returned by {@link useUniversalFeatureRestrictions}.
 */
export interface UniversalFeatureRestrictionsControls {
  showFeatureRestriction: (options: ShowFeatureRestrictionOptions) => void;
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
  request?: ShowFeatureRestrictionOptions;
  open: boolean;
}

/**
 * High-level controls entry point. Exposes imperative show/close controls (via
 * {@link useUniversalFeatureRestrictions}) to descendants and renders the host-provided surface
 * only after the first request.
 */
export const UniversalFeatureRestrictionsProvider = ({ Surface, children }: Props) => {
  const [{ request, open }, setActiveRestriction] = useState<ActiveRestrictionState>({
    open: false,
  });

  const showFeatureRestriction = useCallback((options: ShowFeatureRestrictionOptions) => {
    setActiveRestriction({ request: options, open: true });
  }, []);

  const closeFeatureRestriction = useCallback(() => {
    setActiveRestriction(current => ({ ...current, open: false }));
  }, []);

  const controls = useMemo<UniversalFeatureRestrictionsControls>(
    () => ({ showFeatureRestriction, closeFeatureRestriction }),
    [showFeatureRestriction, closeFeatureRestriction],
  );

  return (
    <UniversalFeatureRestrictionsContext.Provider value={controls}>
      {children}
      {/* Surface mounts only on first show; on Creator Hub this is where the dynamic chunk loads. */}
      {request && <Surface request={request} open={open} onDismiss={closeFeatureRestriction} />}
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
