/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import classnames from "classnames";
import redeemGiftCardTranslationConfig from "../translation.config";
import { giftCardTermsURL, privacyPolicyURL, termsOfUseURL } from "../constants";
import useNeedFirstTimeConsent from "./useNeedFirstTimeConsent";
import "../styles/redeemConsent.scss";

type TRedeemConsent = {
  className?: string;
};

type TRedeemConsentReturn = [
  needFirstTimeConsent: boolean,
  redeemConsentChecked: boolean,
  setNeedFirstTimeConsent: (val: boolean) => void,
  RedeemConsent: React.ComponentType<TRedeemConsent>,
];

export default function useRedeemConsent(): TRedeemConsentReturn {
  const [needFirstTimeConsent, setNeedFirstTimeConsent] = useNeedFirstTimeConsent();
  const [redeemConsentChecked, setRedeemConsentChecked] = useState(false);

  function RedeemConsent({
    translate,
    intl,
    className,
  }: TRedeemConsent & WithTranslationsProps): JSX.Element {
    const locale = intl.getRobloxLocale();

    const legalAgreement = {
      __html: translate("Description.LegalAgreementOnNormalGiftCardRedemptions", {
        termsOfUseLinkStart: `<a href='${termsOfUseURL(locale)}' class='text-link'>`,
        termsOfUseLinkEnd: "</a>",
        privacyPolicyLinkStart: `<a href='${privacyPolicyURL(locale)}' class='text-link'>`,
        privacyPolicyLinkEnd: "</a>",
        giftCardTermsLinkStart: `<a href='${giftCardTermsURL}' class='text-link'>`,
        giftCardTermsLinkEnd: "</a>",
      }),
    };

    const firstTimeLocalCreditRedemptionLegalAgreement = {
      __html: translate(
        "Description.LegalAgreementBeforeFirstTimeGiftCardRedemptionOnLocalCredits",
        {
          termsOfUseLinkStart: `<a href='${termsOfUseURL(locale)}' class='text-link'>`,
          termsOfUseLinkEnd: "</a>",
          privacyPolicyLinkStart: `<a href='${privacyPolicyURL(locale)}' class='text-link'>`,
          privacyPolicyLinkEnd: "</a>",
          giftCardTermsLinkStart: `<a href='${giftCardTermsURL}' class='text-link'>`,
          giftCardTermsLinkEnd: "</a>",
        },
      ),
    };

    const onRedeemConsentChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRedeemConsentChecked(event.target.checked);
    };

    if (needFirstTimeConsent) {
      return (
        <div className={classnames(className, "first-time-redemption-disclosure")}>
          <input
            type="checkbox"
            id="redemption-consent"
            name="redemptionConsent"
            className="checkbox"
            onChange={onRedeemConsentChecked}
            checked={redeemConsentChecked}
          />
          <label
            id="first-time-redemption-disclosure-label"
            dangerouslySetInnerHTML={firstTimeLocalCreditRedemptionLegalAgreement}
            htmlFor="redemption-consent"
          />
        </div>
      );
    }

    return (
      <div
        className={classnames(
          className,
          "legal-agreement text-description legal-agreement-content",
        )}
        dangerouslySetInnerHTML={legalAgreement}
      />
    );
  }
  RedeemConsent.defaultProps = {
    className: null,
  };

  return [
    redeemConsentChecked,
    needFirstTimeConsent,
    setNeedFirstTimeConsent,
    withTranslations(
      RedeemConsent as unknown as React.FC<TRedeemConsent & WithTranslationsProps>,
      redeemGiftCardTranslationConfig,
    ) as unknown as React.FC<TRedeemConsent>,
  ];
}
