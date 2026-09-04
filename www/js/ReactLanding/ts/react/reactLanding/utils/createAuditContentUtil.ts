import { WithTranslationsProps } from 'react-utilities';
import { AuditContentValue } from '../state/auditContentState';

/**
 * Creates an AuditContentValue object from translation parameters.
 *
 * @param translationKey - The translation key (e.g., 'Label.SignUpAgreement') or null
 * @param translationNamespace - The translation namespace (e.g., 'Authentication.Signup')
 * @param translate - The translate function from withTranslations
 * @param translationParameters - The actual parameter values for translation (e.g., { spanStart: '<span>', ... })
 * @returns An AuditContentValue object or null if translationKey is null/empty
 *
 * @example
 * const auditValue = createAuditContent(
 *   'Label.SignUpAgreement',
 *   'Authentication.Signup',
 *   translate,
 *   { spanStart: '<span>', spanEnd: '</span>', termsOfUseLink: '...' }
 * );
 */
export const createAuditContent = (
  translationKey: string | null,
  translationNamespace: string,
  translate: WithTranslationsProps['translate'],
  parameters?: Record<string, string>
): AuditContentValue | null => {
  // Return null if translationKey is null or empty
  if (!translationKey) {
    return null;
  }
  // Generate placeholder parameters: { key: 'value' } => { key: '{key}' }
  let placeholderParams: Record<string, string> = {};
  if (parameters) {
    placeholderParams = Object.keys(parameters).reduce((acc, key) => {
      acc[key] = `{${key}}`;
      return acc;
    }, {} as Record<string, string>);
  }

  // This string will look like the translation hub key with placeholders since audit system requires that parameters be passed separately
  // Example: "By clicking {spanStart}Sign Up{spanEnd}, you are agreeing to the {termsOfUseLink}"
  const translatedSourceString = translate(translationKey, placeholderParams);

  return {
    translationKey,
    translationNamespace,
    translatedSourceString,
    parameters
  };
};

export default createAuditContent;
