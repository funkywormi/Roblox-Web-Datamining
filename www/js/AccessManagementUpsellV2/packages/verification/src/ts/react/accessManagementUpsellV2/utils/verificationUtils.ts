import { getLocale } from '@rbx/amp-v2-wizard/utils/locale';

export default function openVerificationLink(
  verificationLink?: string | null,
  theme?: string | null
): void {
  if (!verificationLink) return;
  // Get user locale and append language parameter if available
  const userLocale = getLocale();
  let linkWithParams = verificationLink;

  if (userLocale) {
    linkWithParams = `${verificationLink}&language=${userLocale}`;
  }
  // Append theme parameter if available (for Persona hosted flow)
  if (theme) {
    linkWithParams = `${linkWithParams}&style-variant=${theme}`;
  }

  window.location.href = linkWithParams;
}
