import { useState, useEffect, useCallback } from "react";
import groupsService, {
  type CommunityNotificationPreferenceType,
  type GroupShoutPreference,
  type GroupShoutPreferencesPayload,
} from "../services/groupsService";

type UseGroupShoutPreferencesResult = {
  preferences: GroupShoutPreferencesPayload | null;
  groups: GroupShoutPreference[] | null;
  loading: boolean;
  error: Error | null;
  updating: boolean;
  setPreference: (
    groupId: number,
    type: CommunityNotificationPreferenceType,
    enabled: boolean,
  ) => Promise<boolean>;
};

export const useGroupShoutPreferences = (): UseGroupShoutPreferencesResult => {
  const [preferences, setPreferences] = useState<GroupShoutPreferencesPayload | null>(null);
  const [groups, setGroups] = useState<GroupShoutPreference[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [prefs, groupsData] = await Promise.all([
        groupsService.getGroupShoutPreferences(),
        groupsService.getUserGroupsWithPreferences(),
      ]);
      setPreferences(prefs);
      setGroups(groupsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch group preferences"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences().catch(() => undefined);
  }, [fetchPreferences]);

  const setPreference = useCallback(
    async (
      groupId: number,
      type: CommunityNotificationPreferenceType,
      enabled: boolean,
    ): Promise<boolean> => {
      if (!groups) return false;

      // Optimistic update - update local state immediately
      const previousGroups = groups;
      setGroups(
        groups.map(group =>
          group.groupId === groupId
            ? {
                ...group,
                notificationPreferences: group.notificationPreferences.map(pref =>
                  pref.type === type ? { ...pref, enabled } : pref,
                ),
              }
            : group,
        ),
      );

      setUpdating(true);

      try {
        await groupsService.updateGroupNotificationPreference(groupId, type, enabled);
        return true;
      } catch {
        // Revert on error
        setGroups(previousGroups);
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [groups],
  );

  return {
    preferences,
    groups,
    loading,
    error,
    updating,
    setPreference,
  };
};
