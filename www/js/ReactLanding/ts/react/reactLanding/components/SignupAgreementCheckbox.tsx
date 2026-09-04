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
import LegalCheckbox from '../../common/components/LegalCheckbox';
import useSignupAuditContent from '../../common/hooks/useSignupAuditContent';

export type SignupAgreementCheckboxProps = {
  locale: string;
  translate: WithTranslationsProps['translate'];
  translationKey: string;
  isChecked: boolean;
  onCheckBoxChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SignupAgreementCheckbox = ({
  locale,
  translate,
  translationKey,
  isChecked,
  onCheckBoxChanged
}: SignupAgreementCheckboxProps): JSX.Element => {
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);

  const termsOfUseLinkElement = `${
    anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.TermsOfUse)}${anchorClosingTag}`;

  const privacyLinkElement = `${
    anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.Privacy)}${anchorClosingTag}`;

  const translationParameters = useMemo(
    () => ({
      termsOfUseLink: termsOfUseLinkElement,
      privacyPolicyLink: privacyLinkElement
    }),
    [termsOfUseLinkElement, privacyLinkElement]
  );

  const legalText = translate(translationKey, translationParameters);

  useSignupAuditContent(translationKey, translate, {
    translationParameters,
    additionalAuditKey: isChecked ? 'isLegalCheckboxChecked' : null,
    additionalAuditValue: 'true'
  });

  return (
    <LegalCheckbox
      id='signup-checkbox'
      legalText={legalText}
      isChecked={isChecked}
      onCheckBoxChanged={onCheckBoxChanged}
    />
  );
};

export default withTranslations(SignupAgreementCheckbox, signupTranslationConfig);
