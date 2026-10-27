import { useTranslatedLegallySensitiveContentAndActions } from './services/legallySensitiveContentService';
import { useLegallySensitiveContentTranslate } from '../accessManagementUpsellV2/hooks/useAmpTranslate';
import ConsentName from './enums/ConsentName';

const useLegallySensitiveContentAndActions = (
  consentName: ConsentName | string,
  surface: string,
  translationArgs?: Record<string, unknown>
): ReturnType<typeof useTranslatedLegallySensitiveContentAndActions> =>
  useTranslatedLegallySensitiveContentAndActions(
    useLegallySensitiveContentTranslate(),
    consentName as ConsentName,
    surface,
    translationArgs
  );

export default useLegallySensitiveContentAndActions;
