import React, { useEffect } from 'react';
import Roblox from 'Roblox';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { useTranslatedLegallySensitiveContentAndActions } from './services/legallySensitiveContentService';
import { legallySensitiveContentTranslationConfig } from '../accessManagementUpsellV2/app.config';
import ConsentName from './enums/ConsentName';

// This container is used to expose the legally sensitive language service to the rest of the app
export const LegallySensitiveContentContainer = ({
  translate
}: {
  translate: TranslateFunction;
}): JSX.Element => {
  useEffect(() => {
    Roblox.LegallySensitiveContentService = {
      useLegallySensitiveContentAndActions: (
        consentName: ConsentName,
        surface: string,
        translationArgs?: Record<string, unknown>
      ) =>
        useTranslatedLegallySensitiveContentAndActions(
          translate,
          consentName,
          surface,
          translationArgs
        )
    };
  }, [translate]);

  return <div id='legally-sensitive-content-component' />;
};

export default withTranslations(
  LegallySensitiveContentContainer,
  legallySensitiveContentTranslationConfig
);
