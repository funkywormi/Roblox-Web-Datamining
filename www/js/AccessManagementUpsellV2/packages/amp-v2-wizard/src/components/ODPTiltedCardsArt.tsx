/**
 * Hero art for the ODP handoff: two tilted, overlapping cards — a shield checkmark (back) and the trusted-
 * connection glyph (front, opaque so it covers the shield). Web counterpart of the lua ODPTiltedCardsArt.
 */

import type { JSX } from "react";
import { Icon } from "@rbx/foundation-ui";

// Each card is centered, then offset and tilted; the front (left) card sits above the back one.
const BACK_CARD =
  "[transform:translate(calc(-50%+50px),calc(-50%-16px))_rotate(15deg)] [z-index:1]";
const FRONT_CARD =
  "[transform:translate(calc(-50%-50px),calc(-50%+16px))_rotate(-15deg)] [z-index:2]";

const CARD_CLASS =
  "stroke-standard stroke-default radius-large content-emphasis bg-surface-0 absolute left-[50%] " +
  "top-[50%] flex height-[112px] width-[112px] items-center justify-center";

// Bigger than the XXLarge preset: override the icon-size var the size class reads.
const GLYPH_SIZE = "[--icon-size-xxlarge:4rem]";

export function ODPTiltedCardsArt(): JSX.Element {
  return (
    <div
      className="relative width-full height-[200px]"
      data-testid="amp-v2-wizard-tilted-cards-art"
    >
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
}
