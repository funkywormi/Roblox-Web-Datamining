import { useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import {
  anchorClosingTag,
  anchorOpeningTag,
  anchorOpeningTagEnd,
  localeParamName,
  signupFormStrings,
  urlConstants,
} from "../constants/signupConstants";

export type legalTextProps = {
  translationKey?: string | null;
  locale: string;
  translate: WithTranslationsProps["translate"];
  /** Set for copy parameterised with `{startTermsTag}`/`{startPrivacyTag}` rather than whole anchors. */
  usesInlineLinkTags?: boolean;
};

export const buildLinkWithLocale = (url: string, locale: string): string => {
  if (locale) {
    return url + localeParamName + locale;
  }

  return url;
};

/** The anchor parameters the agreement copy is interpolated with. */
export const buildLegalTextTranslationParameters = (
  locale: string,
  translate: WithTranslationsProps["translate"],
  usesInlineLinkTags = false,
): Record<string, string> => {
  const termsOfUseLocalizedLink = buildLinkWithLocale(urlConstants.termsOfUse, locale);
  const privacyLocalizedLink = buildLinkWithLocale(urlConstants.privacy, locale);

  if (usesInlineLinkTags) {
    return {
      startTermsTag: anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd,
      endTermsTag: anchorClosingTag,
      startPrivacyTag: anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd,
      endPrivacyTag: anchorClosingTag,
    };
  }

  return {
    termsOfUseLink: `${
      anchorOpeningTag + termsOfUseLocalizedLink + anchorOpeningTagEnd
    }${translate(signupFormStrings.TermsOfUse)}${anchorClosingTag}`,
    privacyPolicyLink: `${
      anchorOpeningTag + privacyLocalizedLink + anchorOpeningTagEnd
    }${translate(signupFormStrings.Privacy)}${anchorClosingTag}`,
  };
};

/**
 * Terms/Privacy agreement text with localized legal links, driven by a single
 * `Authentication.SignUp` translation key. Signup flows pass `translate` from
 * `withTranslations`; the birthday compliance modal passes `useTranslation`'s.
 */
const LegalText = ({
  translationKey,
  locale,
  translate,
  usesInlineLinkTags = false,
}: legalTextProps): JSX.Element => {
  const translationParameters = useMemo(
    () => buildLegalTextTranslationParameters(locale, translate, usesInlineLinkTags),
    [locale, translate, usesInlineLinkTags],
  );

  const effectiveTranslationKey = translationKey ?? signupFormStrings.ComplianceFullCopy;
  const translatedText = translate(effectiveTranslationKey, translationParameters);

  return (
    <div className="legal-text-container legal-text-container-top-margin">
      <div
        className="terms-agreement"
        // eslint-disable-next-line react/no-danger -- localized legal markup with anchor tags.
        dangerouslySetInnerHTML={{
          __html: translatedText,
        }}
      />
    </div>
  );
};

export default LegalText;
