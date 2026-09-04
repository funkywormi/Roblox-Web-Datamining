import { useMemo } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../../reactLanding/translation.config';
import { createAuditContent } from '../../reactLanding/utils/createAuditContentUtil';
import { useCapturedAuditContent, useAdditionalAuditContent } from './useAuditContent';

export type UseSignupAuditContentOptions = {
  translationParameters?: Record<string, string>;
  additionalAuditKey?: string | null;
  additionalAuditValue?: string;
};

/**
 * Custom hook to handle audit content for signup form fields
 * Encapsulates the pattern of creating a full translation key, memoizing audit content,
 * and registering it with the audit content store
 *
 * @param translationKey - The field-specific translation key (e.g., signupFormStrings.Password)
 * @param translate - Translation function from withTranslations
 * @param options - Optional configuration object
 * @param options.translationParameters - Parameters for translation placeholders (e.g., links, spans)
 * @param options.additionalAuditKey - Key for additional audit content (conditional, can be null)
 * @param options.additionalAuditValue - Value for additional audit content
 */
const useSignupAuditContent = (
  translationKey: string,
  translate: WithTranslationsProps['translate'],
  options?: UseSignupAuditContentOptions
): void => {
  const fullTranslationKey = `${signupTranslationConfig.feature}.${translationKey}`;

  const auditContent = useMemo(
    () =>
      createAuditContent(
        translationKey,
        signupTranslationConfig.feature,
        translate,
        options?.translationParameters
      ),
    [translationKey, fullTranslationKey, translate, options?.translationParameters]
  );

  useCapturedAuditContent(fullTranslationKey, auditContent);

  useAdditionalAuditContent(options?.additionalAuditKey, options?.additionalAuditValue || '');
};

export default useSignupAuditContent;
