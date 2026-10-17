import React, { useMemo } from "react";
import { signupFormStrings } from "../constants/signupConstants";
import useSignupAuditContent from "../hooks/useSignupAuditContent";
import LegalTextBase, {
  buildLegalTextTranslationParameters,
  legalTextProps,
} from "@rbx/authentication-common/components/LegalText";

export type { legalTextProps };

/**
 * The shared LegalText plus signup audit-content capture: the signup flows report the
 * agreement text they displayed; the birthday compliance modal renders the base component
 * directly so it does not emit signup audit content.
 */
const LegalText = (props: legalTextProps): JSX.Element => {
  const { locale, translate, usesInlineLinkTags } = props;
  // Memoized because the audit hook re-fires whenever its parameters object changes.
  const translationParameters = useMemo(
    () => buildLegalTextTranslationParameters(locale, translate, usesInlineLinkTags),
    [locale, translate, usesInlineLinkTags],
  );

  const effectiveTranslationKey = props.translationKey ?? signupFormStrings.ComplianceFullCopy;

  useSignupAuditContent(effectiveTranslationKey, translate, { translationParameters });

  return <LegalTextBase {...props} />;
};

export default LegalText;
