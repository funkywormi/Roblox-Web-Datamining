import React, { useEffect } from 'react';
import { window } from '@rbx/core-lib/browser';
import { useTranslatedLegallySensitiveContentAndActions } from './services/legallySensitiveContentService';
import { useLegallySensitiveContentTranslate } from '../accessManagementUpsellV2/hooks/useAmpTranslate';
import ConsentName from './enums/ConsentName';

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === 'true';

// This container is used to expose the legally sensitive language service to the rest of the app
export const LegallySensitiveContentContainer = (): React.JSX.Element => {
  const translate = useLegallySensitiveContentTranslate();

  useEffect(() => {
    if (isNextJs || !window?.Roblox) {
      return;
    }
    Object.assign(window.Roblox, {
      LegallySensitiveContentService: {
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
      }
    });
  }, [translate]);

  return <div id='legally-sensitive-content-component' />;
};

export default LegallySensitiveContentContainer;
