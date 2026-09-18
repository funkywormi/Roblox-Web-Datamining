import React from "react";
import { useArTranslation } from "../util/translate/arTranslation";
import { TranslateInputOrString } from "../util/translate/translate";

/**
 * Essentially a dialog/sheet title that has been moved into the body of the dialog/sheet.
 * So will be displayed just above the main content title in slightly smaller text.
 */
const Eyebrow = ({ eyebrow }: { eyebrow?: TranslateInputOrString }): React.ReactElement | null => {
  const { translate } = useArTranslation();
  if (!eyebrow) return null;
  return <h2 className="text-label-large">{translate(eyebrow)}</h2>;
};

export default Eyebrow;
