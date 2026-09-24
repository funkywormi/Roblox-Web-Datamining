import { Icon } from "@rbx/foundation-ui";

/**
 * Two tilted, overlapping cards: a shield checkmark behind and the parent-and-child glyph in front.
 * Mirrors the art the amp-v2-wizard shows during the on-device parent handoff
 */

const BACK_CARD =
  "[transform:translate(calc(-50%+50px),calc(-50%-16px))_rotate(15deg)] [z-index:1]";
const FRONT_CARD =
  "[transform:translate(calc(-50%-50px),calc(-50%+16px))_rotate(-15deg)] [z-index:2]";

const CARD_CLASS =
  "stroke-standard stroke-default radius-large content-emphasis bg-surface-0 absolute left-[50%] " +
  "top-[50%] flex height-[112px] width-[112px] items-center justify-center";

const GLYPH_SIZE = "[--icon-size-xxlarge:4rem]";

export const OdpTiltedCardsArt = (): JSX.Element => {
  return (
    <div className="relative width-full height-[180px]">
      <div className={`${CARD_CLASS} ${BACK_CARD}`}>
        <Icon name="icon-regular-shield-check" size="XXLarge" className={GLYPH_SIZE} />
      </div>
      <div className={`${CARD_CLASS} ${FRONT_CARD}`}>
        <Icon
          name="icon-regular-person-with-smaller-person"
          size="XXLarge"
          className={GLYPH_SIZE}
        />
      </div>
    </div>
  );
};

export default OdpTiltedCardsArt;
