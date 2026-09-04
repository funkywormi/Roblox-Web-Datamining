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

export type legalTextProps = {
  locale: string;
  translate: WithTranslationsProps['translate'];
  isChecked: boolean;
  onCheckBoxChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TosCheckbox = ({
  locale,
  translate,
  isChecked,
  onCheckBoxChanged
}: legalTextProps): JSX.Element => {
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const termsOfUseLinkElement = `${
    anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd
  }${translate(signupFormStrings.TermsOfUse)}${anchorClosingTag}`;

  const translationParameters = useMemo(
    () => ({
      spanStart: '<span>',
      spanEnd: '</span>',
      termsOfUseLink: termsOfUseLinkElement
    }),
    [termsOfUseLinkElement]
  );

  const legalText = translate(signupFormStrings.ComplianceTos, translationParameters);

  useSignupAuditContent(signupFormStrings.ComplianceTos, translate, {
    translationParameters,
    additionalAuditKey: isChecked ? 'isTosCheckboxChecked' : null,
    additionalAuditValue: 'true'
  });

  return (
    <LegalCheckbox
      id='compliance-tos'
      legalText={legalText}
      isChecked={isChecked}
      onCheckBoxChanged={onCheckBoxChanged}
    />
  );
};

export default withTranslations(TosCheckbox, signupTranslationConfig);
