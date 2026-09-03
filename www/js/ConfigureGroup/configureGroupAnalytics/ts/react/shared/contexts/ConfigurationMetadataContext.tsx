import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GroupConfigurationMetadata } from '../types';

export const ConfigurationMetadataContext = createContext<GroupConfigurationMetadata | undefined>(
  undefined
);

export const useConfigurationMetadata = (): GroupConfigurationMetadata => {
  const resource = useContext(ConfigurationMetadataContext);
  if (!resource) {
    throw new Error('useConfigurationMetadata must be used within a ConfigurationMetadataContext');
  }
  return resource;
};

export type ConfigurationMetadataProviderProps = {
  metadata: GroupConfigurationMetadata;
  children: React.ReactNode;
};

export function ConfigurationMetadataProvider({
  metadata,
  children
}: ConfigurationMetadataProviderProps): JSX.Element {
  return (
    <ConfigurationMetadataContext.Provider value={metadata}>
      {children}
    </ConfigurationMetadataContext.Provider>
  );
}
