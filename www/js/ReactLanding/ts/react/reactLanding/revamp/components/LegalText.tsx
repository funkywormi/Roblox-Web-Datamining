import React from 'react';
import { useTranslation } from 'react-utilities';
import {
  signupFormStrings,
  urlConstants,
  anchorOpeningTag,
  anchorOpeningTagEnd,
  anchorClosingTag
} from '../../constants/signupConstants';
import { buildLinkWithLocale } from '../../utils/signupUtils';

export type LegalTextProps = {
  locale: string;
};

const LegalText = ({ locale }: LegalTextProps): JSX.Element => {
  const { translate } = useTranslation();
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);
  const termsOfUseLinkElement = `${anchorOpeningTag}${termsOfUseLocalizedLink}${anchorOpeningTagEnd}${translate(
    signupFormStrings.TermsOfUse
  )}${anchorClosingTag}`;
  const privacyLinkElement = `${anchorOpeningTag}${privacyLocalizedLink}${anchorOpeningTagEnd}${translate(
    signupFormStrings.Privacy
  )}${anchorClosingTag}`;

  return (
    <p
      className='legal-text text-caption-medium'
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: translate(signupFormStrings.SignUpAgreementFullCopyFullParams, {
          buttonText: translate(signupFormStrings.CreateAccountSentenceCase),
          termsOfUseLink: termsOfUseLinkElement,
          privacyPolicyLink: privacyLinkElement
        })
      }}
    />
  );
};

export default LegalText;
