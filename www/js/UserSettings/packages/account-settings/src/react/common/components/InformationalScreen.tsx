import React from "react";
import useWrappedTranslation from "../../userSettings/hooks/useWrappedTranslation";

/* 
  An informational screen with text only, used for empty or error states.
*/
export const InformationalScreen = ({
  descriptionTranslationKey,
}: {
  descriptionTranslationKey: string;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  return <div className="text-description">{translate(descriptionTranslationKey)}</div>;
};

export default InformationalScreen;
