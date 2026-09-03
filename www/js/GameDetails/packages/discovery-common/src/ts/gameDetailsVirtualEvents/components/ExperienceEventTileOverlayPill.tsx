import React, { useMemo } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import {
  getTranslationStringForKeyWithFallback,
  eventCategoryTranslationKeys,
  TEventCategoryLabel,
} from "../constants/constants";
import { getLocalizedDateString, tryParseDate } from "../utils/utils";
import { GameTileTextPill } from "../../common/components/GameTileOverlayPill";

type TExperienceEventTileOverlayPillProps = {
  isEventLive: boolean;
  eventStartTimeUtc: string;
  eventCategory: TEventCategoryLabel | undefined;
  translate: TranslateFunction;
};

const ExperienceEventTileOverlayPill = ({
  isEventLive,
  eventStartTimeUtc,
  eventCategory,
  translate,
}: TExperienceEventTileOverlayPillProps): JSX.Element => {
  const tileBadgeText = useMemo(() => {
    if (isEventLive) {
      if (eventCategory && eventCategoryTranslationKeys[eventCategory]) {
        return translate(eventCategoryTranslationKeys[eventCategory]);
      }

      return getTranslationStringForKeyWithFallback(translate, "happeningNow");
    }

    return getLocalizedDateString(tryParseDate(eventStartTimeUtc));
  }, [isEventLive, eventCategory, eventStartTimeUtc, translate]);

  return <GameTileTextPill text={tileBadgeText} />;
};

export default ExperienceEventTileOverlayPill;
