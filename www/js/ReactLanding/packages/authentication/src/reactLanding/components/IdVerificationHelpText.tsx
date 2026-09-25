import React from "react";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { idVerificationTranslationConfig } from "../translation.config";
import { signupFormStrings } from "../constants/signupConstants";

const IdVerificationHelpText = (): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div className="text font-caption-body signup-korea-parent-hint">
      {translate(signupFormStrings.KoreaAdultUser)}
    </div>
  );
};

export default IdVerificationHelpText;
