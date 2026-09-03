import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { createContext, useContext } from 'react';
import type { PermissionsUIConfig } from '../utils/types';

const UIConfigContext = createContext<PermissionsUIConfig | null>(null);

export const PermissionsUIConfigProvider: FunctionComponent<
  PropsWithChildren<PermissionsUIConfig>
> = ({ children, ...config }) => {
  return <UIConfigContext.Provider value={config}>{children}</UIConfigContext.Provider>;
};

export function usePermissionsUiConfig(): PermissionsUIConfig {
  const uiConfig = useContext(UIConfigContext);
  if (!uiConfig) {
    throw new Error('usePermissionsUiConfig must be used within a PermissionsUIConfigProvider');
  }
  return uiConfig;
}
