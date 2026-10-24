import { useCallback, useContext } from "react";
import { useFullKeyTranslations, useTranslations } from "@rbx/www-common/i18n";
import { window } from "@rbx/core-lib/browser";
import { SectionBase, SectionGiftCard } from "../../types/buyRobuxPageData";
import { BaseSectionProps, Section, SectionBody, SectionHeader } from "../sections/Section";
import { SectionBodySimpleCTA } from "../sections/SectionBodySimpleCTA";
import { TrackingContext } from "../../contexts/TrackingContext";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";
import {
  getOpenExternalBrowserUrl,
  shouldOpenInExternalBrowser,
} from "../../utils/openExternalBrowser";

type GiftCardProps = BaseSectionProps & {
  sectionBase: SectionBase;
  giftCard: SectionGiftCard;
};

export function GiftCard({ isPrimary, sectionBase, giftCard }: GiftCardProps) {
  const { trackGiftCardClick } = useContext(TrackingContext);

  const { translateFullKey } = useFullKeyTranslations();
  const translatePremium = useTranslations("Feature.Premium");

  const buttonClickHandler = useCallback(() => {
    trackGiftCardClick();
    window?.location.assign(
      shouldOpenInExternalBrowser()
        ? getOpenExternalBrowserUrl(giftCard.redirectUrl)
        : giftCard.redirectUrl,
    );
  }, [trackGiftCardClick, giftCard.redirectUrl]);

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>{translateFullKey(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
      <SectionBody isPrimary={isPrimary}>
        <SectionBodySimpleCTA
          title={translateFullKey(
            giftCard.titleTranslationKey,
            undefined,
            translatePremium("Description.GiftCard"),
          )}
          body={translateFullKey(giftCard.bodyTranslationKey)}
          buttonText={translateFullKey(giftCard.buttonTextTranslationKey)}
          buttonClickHandler={buttonClickHandler}
        />
      </SectionBody>
    </Section>
  );
}
