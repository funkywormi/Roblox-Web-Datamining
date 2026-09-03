import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
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

  const { translate } = useTranslation();

  const buttonClickHandler = useCallback(() => {
    trackRobuxGiftClick();
    openModal();
  }, [trackRobuxGiftClick, openModal]);

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>{translate(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
      <SectionBody isPrimary={isPrimary}>
        <SectionBodySimpleCTA
          titleTranslationKey={robuxGift.titleTranslationKey}
          bodyTranslationKey={robuxGift.bodyTranslationKey}
          buttonTextTranslationKey={robuxGift.buttonTextTranslationKey}
          buttonClickHandler={buttonClickHandler}
        />
      </SectionBody>
    </Section>
  );
}
