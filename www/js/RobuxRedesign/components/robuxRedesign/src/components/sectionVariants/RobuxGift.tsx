import { useCallback, useContext } from "react";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
import { SectionBase, SectionRobuxGiftPurchase } from "../../types/buyRobuxPageData";
import { SectionHeader, SectionBody, Section, BaseSectionProps } from "../sections/Section";
import { SectionBodySimpleCTA } from "../sections/SectionBodySimpleCTA";
import { ModalContext } from "../../contexts/ModalContext";
import { TrackingContext } from "../../contexts/TrackingContext";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";

type RobuxGiftProps = BaseSectionProps & {
  robuxGift: SectionRobuxGiftPurchase;
  sectionBase: SectionBase;
};

export function RobuxGift({ isPrimary, robuxGift, sectionBase }: RobuxGiftProps) {
  const {
    robuxGifting: { openModal },
  } = useContext(ModalContext);
  const { trackRobuxGiftClick } = useContext(TrackingContext);

  const { translateFullKey } = useFullKeyTranslations();

  const buttonClickHandler = useCallback(() => {
    trackRobuxGiftClick();
    openModal();
  }, [trackRobuxGiftClick, openModal]);

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>{translateFullKey(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
      <SectionBody isPrimary={isPrimary}>
        <SectionBodySimpleCTA
          title={translateFullKey(robuxGift.titleTranslationKey)}
          body={translateFullKey(robuxGift.bodyTranslationKey)}
          buttonText={translateFullKey(robuxGift.buttonTextTranslationKey)}
          buttonClickHandler={buttonClickHandler}
        />
      </SectionBody>
    </Section>
  );
}
