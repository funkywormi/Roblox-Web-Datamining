import React, { FC } from "react";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import translationConfig from "../translation.config";
import { NotificationLocalizationContext } from "./NotificationsLocalization";

const NotificationLocalizationComponent: FC<WithTranslationsProps> = ({ children, translate }) => {
  return (
    <NotificationLocalizationContext.Provider value={translate}>
      {children}
    </NotificationLocalizationContext.Provider>
  );
};

const NotificationLocalizationProvider = withTranslations(
  NotificationLocalizationComponent,
  translationConfig,
);

export { NotificationLocalizationProvider };
