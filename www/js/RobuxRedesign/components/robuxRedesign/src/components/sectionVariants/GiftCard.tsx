import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { SectionBase, SectionGiftCard } from "../../types/buyRobuxPageData";
import { BaseSectionProps, Section, SectionBody, SectionHeader } from "../sections/Section";
import { SectionBodySimpleCTA } from "../sections/SectionBodySimpleCTA";
import { TrackingContext } from "../../contexts/TrackingContext";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";

type GiftCardProps = BaseSectionProps & {
  sectionBase: SectionBase;
  giftCard: SectionGiftCard;
};

export function GiftCard({ isPrimary, sectionBase, giftCard }: GiftCardProps) {
  const { trackGiftCardClick } = useContext(TrackingContext);

  const { translate } = useTranslation();

  const buttonClickHandler = useCallback(() => {
    trackGiftCardClick();
    window.open(giftCard.redirectUrl, "_blank");
  }, [trackGiftCardClick, giftCard.redirectUrl]);

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>{translate(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
      <SectionBody isPrimary={isPrimary}>
        <SectionBodySimpleCTA
          // TODO: remove translation key fallback once BE is updated to return titleTranslationKey
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          titleTranslationKey={giftCard.titleTranslationKey ?? "Description.GiftCard"}
          bodyTranslationKey={giftCard.bodyTranslationKey}
          buttonTextTranslationKey={giftCard.buttonTextTranslationKey}
          buttonClickHandler={buttonClickHandler}
        />
      </SectionBody>
    </Section>
  );
}
