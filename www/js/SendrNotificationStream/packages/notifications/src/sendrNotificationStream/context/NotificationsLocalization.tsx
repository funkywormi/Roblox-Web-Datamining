import { createContext, useContext } from "react";

export type TranslateFunction = (
  resourceId: string,
  parameters?: Record<string, unknown>,
  fallbackString?: string,
) => string;

const NotificationLocalizationContext = createContext<TranslateFunction>(
  (resourceId, params) => resourceId,
);

const useNotificationLocalization = (): TranslateFunction => {
  return useContext(NotificationLocalizationContext);
};

export { NotificationLocalizationContext, useNotificationLocalization };
