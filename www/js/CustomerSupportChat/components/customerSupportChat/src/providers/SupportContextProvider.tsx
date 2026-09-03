import React, { createContext, useCallback, useEffect, useState } from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  SupportContextKey,
  SupportInquiryContext,
  SupportInquiryContextPartial,
} from "../core/types/common";
import {
  useFetchMetadata,
  useFetchUserSettingsLegacy,
  useFetchUserSettingsV1,
} from "../hooks/supportFormServices";
import { toDOBToAgeGroupTag } from "../core/helpers/ageGateHelper";
import { AgeGateDOBGroupLabel } from "../core/types/ageGate";
import { isProd } from "../core/helpers/supportEnvironment";

const errorStoreNotInitialized = () => {
  console.error(`SupportContextProvider: Context Store not yet initialized!`);
};

// https://react.dev/reference/react/createContext
export const SupportContext = createContext<SupportInquiryContext>({
  updateSupportInquiryContext: errorStoreNotInitialized,
});

export const SupportContextProvider: React.FC = ({ children }) => {
  const [supportInquiryState, setSupportInquiryState] = useState<SupportInquiryContextPartial>({});

  // Load and listen to page metadata and user auth changes, sync with context store
  const { data: metadata, error: metadataError } = useFetchMetadata();
  const { data: userSettingsLegacyData, error: userSettingsLegacyError } =
    useFetchUserSettingsLegacy();
  const { data: userSettingsData, error: userSettingsError } = useFetchUserSettingsV1();

  const updateSupportInquiryContext = useCallback((newContext: SupportInquiryContextPartial) => {
    setSupportInquiryState(prevState => {
      const newAgeGateDate = newContext[SupportContextKey.AgeGate];
      const newSyncedSupportState: SupportInquiryContextPartial = {
        ...prevState,
        ...newContext,
        ...(newAgeGateDate && {
          [SupportContextKey.AgeGateTag]: toDOBToAgeGroupTag(newAgeGateDate),
        }),
        ...(authenticatedUser?.isAuthenticated && {
          [SupportContextKey.AgeGateTag]: authenticatedUser?.isUnder13
            ? AgeGateDOBGroupLabel.AgeUnder13
            : AgeGateDOBGroupLabel.Age13AndOver,
        }),
      };

      if (newSyncedSupportState[SupportContextKey.AgeGateTag]) {
        newSyncedSupportState[SupportContextKey.isUnder13] =
          newSyncedSupportState[SupportContextKey.AgeGateTag] === AgeGateDOBGroupLabel.AgeUnder13;
      }

      // Persist AgeGate DOB to local storage
      const clientPersistedDateOfBirth = newContext[SupportContextKey.AgeGate]?.toString();
      if (clientPersistedDateOfBirth)
        localStorage.setItem(SupportContextKey.AgeGate, clientPersistedDateOfBirth);

      return newSyncedSupportState;
    });
  }, []);

  // Sync meta data, user settings, and authed user
  useEffect(() => {
    // Load AgeGate value from local storage if available
    const ageGateValue = localStorage.getItem(SupportContextKey.AgeGate);
    const ageGateDate = ageGateValue ? new Date(ageGateValue) : undefined;

    const newSyncedSupportState: SupportInquiryContextPartial = {
      [SupportContextKey.Metadata]: metadata,
      [SupportContextKey.UserSettingsLegacy]: userSettingsLegacyData,
      [SupportContextKey.UserSettingsV1]: userSettingsData,
      [SupportContextKey.AuthUser]: authenticatedUser,
      [SupportContextKey.AgeGate]: ageGateDate,
      ...(ageGateDate && {
        [SupportContextKey.AgeGateTag]: toDOBToAgeGroupTag(ageGateDate),
      }),
      ...(authenticatedUser?.isAuthenticated && {
        [SupportContextKey.AgeGateTag]: authenticatedUser?.isUnder13
          ? AgeGateDOBGroupLabel.AgeUnder13
          : AgeGateDOBGroupLabel.Age13AndOver,
      }),
    };

    if (newSyncedSupportState[SupportContextKey.AgeGateTag]) {
      newSyncedSupportState[SupportContextKey.isUnder13] =
        newSyncedSupportState[SupportContextKey.AgeGateTag] === AgeGateDOBGroupLabel.AgeUnder13;
    }

    setSupportInquiryState(prevState => ({
      ...prevState,
      ...newSyncedSupportState,
    }));

    const isMetadataOrUserSettingsError =
      metadataError || userSettingsLegacyError || userSettingsError;
    if (!isProd && isMetadataOrUserSettingsError) {
      const allUserAndMetadataErrors = {
        metadataError,
        userSettingsLegacyError,
        userSettingsError,
      };
      const errorMessage = Object.entries(allUserAndMetadataErrors)
        .map(([key, val]) => (!val?.message ? "" : `${key}: ${val?.message}`))
        .filter(Boolean)
        .join(", ");

      console.error(`Error fetching user settings or metadata: ${errorMessage}`);
    }
  }, [
    metadata,
    metadataError,
    userSettingsLegacyData,
    userSettingsLegacyError,
    userSettingsData,
    userSettingsError,
  ]);

  // Context value to be provided and closure for updating as needed
  const contextValue: SupportInquiryContext = {
    ...supportInquiryState,
    updateSupportInquiryContext,
  };

  return <SupportContext.Provider value={contextValue}>{children}</SupportContext.Provider>;
};
