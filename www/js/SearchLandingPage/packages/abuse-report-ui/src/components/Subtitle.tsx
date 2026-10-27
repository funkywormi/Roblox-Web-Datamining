import React from "react";
import { useArTranslation } from "../util/translate/arTranslation";
import { TranslateInputOrString } from "../util/translate/translate";

export type SubtitleValue = {
  /** Icon name. Ignored on web (matches list-item `leading`). */
  leading?: string;
  text: TranslateInputOrString;
};

/**
 * Optional subtitle shown below the node title.
 * `leading` icons are not rendered on web.
 */
const Subtitle = ({ subtitle }: { subtitle?: SubtitleValue }): React.ReactElement | null => {
  const { translate } = useArTranslation();
  if (!subtitle) return null;
  return (
    <div className="text-body-medium content-muted margin-top-none margin-bottom-medium">
      {translate(subtitle.text)}
    </div>
  );
};

export default Subtitle;
