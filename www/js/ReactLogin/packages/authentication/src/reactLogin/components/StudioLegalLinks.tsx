import type { JSX } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { urlConstants as signupUrlConstants } from "../../reactLanding/constants/signupConstants";
import { buildLinkWithLocale } from "../../reactLanding/utils/signupUtils";

const studioLegalLinkStrings = {
  Terms: "Label.Terms",
  Privacy: "Label.Privacy",
};

const studioLegalLinksTranslationConfig = {
  common: [],
  feature: "CommonUI.Features",
};

export const StudioLegalLinks = ({ translate, intl }: WithTranslationsProps): JSX.Element => {
  const locale = intl.getRobloxLocale();
  const termsOfUseUrl = buildLinkWithLocale(signupUrlConstants.termsOfUse, locale);
  const privacyPolicyUrl = buildLinkWithLocale(signupUrlConstants.privacy, locale);

  return (
    <div className="studio-legal-links text-center">
      <a className="text-link" href={termsOfUseUrl} target="_blank" rel="noreferrer">
        {translate(studioLegalLinkStrings.Terms)}
      </a>
      <a className="text-link" href={privacyPolicyUrl} target="_blank" rel="noreferrer">
        {translate(studioLegalLinkStrings.Privacy)}
      </a>
    </div>
  );
};

export default withTranslations(StudioLegalLinks, studioLegalLinksTranslationConfig);
