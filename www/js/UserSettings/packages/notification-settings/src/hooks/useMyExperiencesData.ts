import { useState, useEffect, useCallback } from "react";
import experiencePreferencesService, {
  type ExperiencePreferencesPayload,
} from "../services/experiencePreferencesService";
import gamesService, { type GameDetail } from "../services/gamesService";

export type MyExperienceRow = {
  universeId: number;
  placeId: number | null;
  name: string;
  creatorName: string;
  isEnabled: boolean;
};

const buildRows = (
  universeIds: readonly number[],
  games: readonly GameDetail[],
): MyExperienceRow[] => {
  const byId = new Map<number, GameDetail>(games.map(g => [g.id, g]));
  return universeIds.map(universeId => {
    const game = byId.get(universeId);
    return {
      universeId,
      placeId: game?.rootPlaceId ?? null,
      name: game?.name ?? "",
      creatorName: game?.creator?.name ?? "",
      isEnabled: true,
    };
  });
};

type UseMyExperiencesDataResult = {
  preferences: ExperiencePreferencesPayload | null;
  rows: MyExperienceRow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setExperienceEnabled: (universeId: number, enabled: boolean) => void;
};

export const useMyExperiencesData = (): UseMyExperiencesDataResult => {
  const [preferences, setPreferences] = useState<ExperiencePreferencesPayload | null>(null);
  const [rows, setRows] = useState<MyExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prefs = await experiencePreferencesService.getExperiencePreferences();
      setPreferences(prefs);
      const ids = prefs.notificationsEnabledExperiences ?? [];
      if (ids.length === 0) {
        setRows([]);
        return;
      }
      const games = await gamesService.getGamesByUniverseIds(ids);
      setRows(buildRows(ids, games));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load experience preferences"));
      setPreferences(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const setExperienceEnabled = useCallback((universeId: number, enabled: boolean) => {
    setRows(prev =>
      prev.map(r => (r.universeId === universeId ? { ...r, isEnabled: enabled } : r)),
    );
  }, []);

  return {
    preferences,
    rows,
    loading,
    error,
    refetch: load,
    setExperienceEnabled,
  };
};
