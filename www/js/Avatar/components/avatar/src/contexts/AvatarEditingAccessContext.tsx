import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter } from "@rbx/www-common/intl";
import AvatarAPIService from "../services/avatarAPIService";
import { takeStartupRequest } from "../startupRequests";
import { getAvatarAccessStatus, NOT_BLOCKED } from "../utils/featureAccess.utils";

interface AvatarEditingAccessContextType {
  isAvatarEditingBlocked: boolean;
  hasTimeoutAction: boolean;
  blockEndTime: Date | null;
  formattedBlockEndTime: string | null;
  isLoading: boolean;
  /**
   * Fetches feature access again, ignoring any request already in flight. On failure it keeps the
   * last known state, so editing stays blocked.
   */
  refetchAccess: () => Promise<void>;
}

const REFETCH_RETRIES = 3;

// One query per mount, so a remount on a reused QueryClient loads fresh instead of showing cached
// result.
let providerInstances = 0;

// The first fetch uses the startup prefetch. Refetches always go to the API.
const takeFeatureAccess = () => takeStartupRequest("featureAccess");
const fetchFeatureAccess = () => AvatarAPIService.getFeatureAccess();

const AvatarEditingAccessContext = createContext<AvatarEditingAccessContextType | undefined>(
  undefined,
);

export const useAvatarEditingAccessContext = () => {
  const context = useContext(AvatarEditingAccessContext);
  if (!context) {
    throw new Error(
      "useAvatarEditingAccessContext must be used within an AvatarEditingAccessProvider",
    );
  }
  return context;
};

interface AvatarEditingAccessProviderProps {
  children: React.ReactNode;
}

export const AvatarEditingAccessProvider: React.FC<AvatarEditingAccessProviderProps> = ({
  children,
}) => {
  const formatter = useFormatter();
  const queryClient = useQueryClient();
  const [queryKey] = useState(() => {
    providerInstances += 1;
    return ["avatar/featureAccess", providerInstances];
  });

  // Error fetching feature access defaults to not blocked. Fetch once per mount.
  const { data: accessStatus = NOT_BLOCKED, isLoading } = useQuery({
    queryKey,
    queryFn: takeFeatureAccess,
    select: getAvatarAccessStatus,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const formattedBlockEndTime = useMemo(
    () =>
      accessStatus.isBlocked && accessStatus.endTime
        ? formatter.dateTime(accessStatus.endTime, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : null,
    [accessStatus.isBlocked, accessStatus.endTime, formatter],
  );

  const refetchAccess = useCallback(async () => {
    await queryClient.cancelQueries({ queryKey });
    try {
      await queryClient.fetchQuery({
        queryKey,
        queryFn: fetchFeatureAccess,
        staleTime: 0,
        retry: REFETCH_RETRIES,
      });
    } catch {
      // react-query keeps the previous data, so editing stays blocked.
    }
  }, [queryClient, queryKey]);

  const contextValue = useMemo(
    () => ({
      isAvatarEditingBlocked: accessStatus.isBlocked,
      hasTimeoutAction: accessStatus.hasTimeoutAction,
      blockEndTime: accessStatus.endTime,
      formattedBlockEndTime,
      isLoading,
      refetchAccess,
    }),
    [
      accessStatus.isBlocked,
      accessStatus.hasTimeoutAction,
      accessStatus.endTime,
      formattedBlockEndTime,
      isLoading,
      refetchAccess,
    ],
  );

  return (
    <AvatarEditingAccessContext.Provider value={contextValue}>
      {children}
    </AvatarEditingAccessContext.Provider>
  );
};
