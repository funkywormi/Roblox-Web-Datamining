import { FC } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { translationConfig } from "../translation.config";
import { translations, URLs } from "../constants/Constants";

const {
  legalDisclosure: { key: legalDisclosure, default: legalDisclosureDefault },
} = translations;

type GiftingProductsLegalDisclosureProps = {
  legalDisclosureTranslationKey?: string;
} & WithTranslationsProps;

const GiftingProductsLegalDisclosure: FC<GiftingProductsLegalDisclosureProps> = ({
  translate,
  legalDisclosureTranslationKey,
}) => {
  const privacyLinkStart = `<a href="${urlService.getAbsoluteUrl(
    URLs.privacyUrl,
  )}" class="text-link">`;
  const termsLinkStart = `<a href="${urlService.getAbsoluteUrl(URLs.termsUrl)}" class="text-link">`;
  const anchorEnd = "</a>";

  // Use legalDisclosureTranslationKey if provided, otherwise fall back to default legalDisclosure
  const translationKey = legalDisclosureTranslationKey ?? legalDisclosure;
  const displayText =
    translate(translationKey, {
      privacyLinkStart,
      privacyLinkEnd: anchorEnd,
      termsLinkStart,
      termsLinkEnd: anchorEnd,
    }) || legalDisclosureDefault;

  return (
    <div className="gifting-products-legal-disclosure-container">
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: displayText,
        }}
      />
    </div>
  );
};

export default withTranslations(GiftingProductsLegalDisclosure, translationConfig);
