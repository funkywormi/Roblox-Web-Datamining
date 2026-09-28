import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useLayerTreatments, ExperimentationLayer, ExperimentKey } from "./experimentationUtils";

/**
 * Schema defining all experiment keys and their value types for the Social.Profile layer.
 */
type ExperimentsSchema = {
  [ExperimentKey.PlaceholderKey]: boolean; // this exists to keep typescript happy when there are no active experiments
  [ExperimentKey.IsWebUserProfileFavoritesRedesignEnabled]: boolean;
  [ExperimentKey.IsIARCProfileRedesignEnabled]: boolean;
  [ExperimentKey.IsWebProfileBackgroundEnabled]: boolean;
  [ExperimentKey.IsCurrentlyPlayingCardClickableEnabled]: boolean;
  [ExperimentKey.IsActionsV2Enabled]: boolean;
  [ExperimentKey.IsWebProfileCreationsMigrationEnabled]: boolean;
};

interface ExperimentsContextValue {
  /**
   * Whether the experiment layer has finished loading.
   */
  isLoaded: boolean;

  /**
   * Get a typed experiment value by key.
   * @param key - The experiment key from ExperimentKey
   * @returns The experiment value or null if not loaded yet
   */
  getValue: <K extends keyof ExperimentsSchema>(key: K) => ExperimentsSchema[K] | null;

  /**
   * Convenience method to check if a boolean experiment is in treatment.
   * Only works with boolean experiment keys.
   * @param key - The experiment key from ExperimentKey
   * @returns true if in treatment, false if in control, null if not loaded yet
   */
  isInTreatment: (key: keyof ExperimentsSchema) => boolean | null;
}

const ExperimentsContext = createContext<ExperimentsContextValue | undefined>(undefined);

const profileExperimentKeys = Object.values(ExperimentKey);
const isPlaceholderTheOnlyExperiment =
  profileExperimentKeys.length === 1 && profileExperimentKeys[0] === ExperimentKey.PlaceholderKey;

export const ExperimentsProvider = ({
  children,
  layer,
}: {
  children: ReactNode;
  layer: ExperimentationLayer;
}): React.JSX.Element => {
  const mockLayerValues = useMemo<Partial<ExperimentsSchema> | undefined>(
    () => (isPlaceholderTheOnlyExperiment ? {} : undefined),
    [],
  );

  const { getValue: baseGetValue, isLoaded } = useLayerTreatments<ExperimentsSchema>(
    layer,
    mockLayerValues,
  );

  const getValue = useMemo(
    () =>
      <K extends keyof ExperimentsSchema>(key: K): ExperimentsSchema[K] | null =>
        baseGetValue(key),
    [baseGetValue],
  );

  const isInTreatment = useMemo(
    () =>
      (key: keyof ExperimentsSchema): boolean | null => {
        const value = getValue(key);
        if (typeof value !== "boolean") {
          return null;
        }
        return value;
      },
    [getValue],
  );

  const value = useMemo(
    () => ({ getValue, isInTreatment, isLoaded }),
    [getValue, isInTreatment, isLoaded],
  );

  return <ExperimentsContext.Provider value={value}>{children}</ExperimentsContext.Provider>;
};

export const useExperiments = (): ExperimentsContextValue => {
  const context = useContext(ExperimentsContext);
  if (!context) {
    throw new Error("useExperiments must be used within ExperimentsProvider");
  }
  return context;
};
