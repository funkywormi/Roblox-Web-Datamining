import React, { useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import {
  signupFormStrings,
  urlConstants,
  anchorOpeningTag,
  anchorOpeningTagEnd,
  anchorClosingTag
} from '../constants/signupConstants';
import { buildLinkWithLocale } from '../utils/signupUtils';
import useSignupAuditContent from '../../common/hooks/useSignupAuditContent';

export type legalTextProps = {
  translationKey?: string | null;
  locale: string;
  translate: WithTranslationsProps['translate'];
  /** Set for copy parameterised with `{startTermsTag}`/`{startPrivacyTag}` rather than whole anchors. */
  usesInlineLinkTags?: boolean;
};

const LegalText = ({
  translationKey,
  locale,
  translate,
  usesInlineLinkTags = false
}: legalTextProps): JSX.Element => {
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);
  const termsOfUseLinkElement = `${
    anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.TermsOfUse)}${anchorClosingTag}`;
  const privacyLinkElement = `${
    anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.Privacy)}${anchorClosingTag}`;

  const translationParameters = useMemo(
    () =>
      usesInlineLinkTags
        ? {
            startTermsTag: anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd,
            endTermsTag: anchorClosingTag,
            startPrivacyTag: anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd,
            endPrivacyTag: anchorClosingTag
          }
        : {
            termsOfUseLink: termsOfUseLinkElement,
            privacyPolicyLink: privacyLinkElement
          },
    [
      usesInlineLinkTags,
      termsOfUseLocalizedLink,
      privacyLocalizedLink,
      termsOfUseLinkElement,
      privacyLinkElement
    ]
  );

  const effectiveTranslationKey = translationKey ?? signupFormStrings.ComplianceFullCopy;
  const translatedText = translate(effectiveTranslationKey, translationParameters);

  useSignupAuditContent(effectiveTranslationKey, translate, {
    translationParameters
  });

  return (
    <div className='legal-text-container legal-text-container-top-margin'>
      <div
        className='terms-agreement'
        dangerouslySetInnerHTML={{
          __html: translatedText
        }}
      />
    </div>
  );
};

export default withTranslations(LegalText, signupTranslationConfig);
