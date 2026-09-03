import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useFormatter } from "@rbx/www-common/intl";
import AvatarAPIService from "../services/avatarAPIService";
import { getAvatarAccessStatus, AvatarAccessStatus } from "../utils/featureAccess.utils";

interface AvatarEditingAccessContextType {
  isAvatarEditingBlocked: boolean;
  blockEndTime: Date | null;
  formattedBlockEndTime: string | null;
  isLoading: boolean;
}

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
  const [accessStatus, setAccessStatus] = useState<AvatarAccessStatus>({
    isBlocked: false,
    endTime: null,
    durationSeconds: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formattedBlockEndTime, setFormattedBlockEndTime] = useState<string | null>(null);
  const formatter = useFormatter();

  useEffect(() => {
    AvatarAPIService.getFeatureAccess()
      .then(response => {
        const status = getAvatarAccessStatus(response);
        setAccessStatus(status);

        if (status.isBlocked && status.endTime) {
          const formatted = formatter.dateTime(status.endTime, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          setFormattedBlockEndTime(formatted);
        }
      })
      .catch(() => {
        // Error fetching feature access - default to not blocked
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formatter]);

  const contextValue = useMemo(
    () => ({
      isAvatarEditingBlocked: accessStatus.isBlocked,
      blockEndTime: accessStatus.endTime,
      formattedBlockEndTime,
      isLoading,
    }),
    [accessStatus.isBlocked, accessStatus.endTime, formattedBlockEndTime, isLoading],
  );

  return (
    <AvatarEditingAccessContext.Provider value={contextValue}>
      {children}
    </AvatarEditingAccessContext.Provider>
  );
};
