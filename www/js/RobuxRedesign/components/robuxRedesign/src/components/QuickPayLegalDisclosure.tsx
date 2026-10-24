import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { TranslateHtmlTag } from "@rbx/translation-utils";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";

const DEFAULT_TRANSLATION_KEY = "Feature.BuyRobux.Message.QuickPay.LegalDisclosureText";
const STRIPE_LEGAL_URL = "https://stripe.com/legal/consumer";

const TERMS_URL = getAbsoluteUrl("/info/terms");
const PRIVACY_URL = getAbsoluteUrl("/info/privacy");
const BILLING_URL = getAbsoluteUrl("/my/account#!/billing");

function createLinkTag(opening: string, closing: string, href: string): TranslateHtmlTag {
  return {
    closing,
    opening,
    render: text => (
      <a href={href} className="text-link">
        {text}
      </a>
    ),
  };
}

const QUICK_PAY_LEGAL_DISCLOSURE_TAGS: TranslateHtmlTag[] = [
  createLinkTag("termsLinkStart", "termsLinkEnd", TERMS_URL),
  createLinkTag("privacyLinkStart", "privacyLinkEnd", PRIVACY_URL),
  createLinkTag("billingLinkStart", "billingLinkEnd", BILLING_URL),
  createLinkTag("stripeTermsLinkStart", "stripeTermsLinkEnd", STRIPE_LEGAL_URL),
  createLinkTag("stripePrivacyLinkStart", "stripePrivacyLinkEnd", STRIPE_LEGAL_URL),
];

type QuickPayLegalDisclosureProps = {
  translationKey?: string;
};

export function QuickPayLegalDisclosure({ translationKey }: QuickPayLegalDisclosureProps) {
  const { translateFullKey } = useFullKeyTranslations();

  return (
    <div className="legal-disclosure-container">
      <p className="text-footer legal-text-holder content-default" style={{ fontSize: 10 }}>
        {translateFullKey.html(
          translationKey ?? DEFAULT_TRANSLATION_KEY,
          QUICK_PAY_LEGAL_DISCLOSURE_TAGS,
        )}
      </p>
    </div>
  );
}
