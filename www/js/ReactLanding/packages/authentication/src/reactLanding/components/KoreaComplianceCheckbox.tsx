import React from "react";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { oneTimePassTranslationConfig } from "../translation.config";
import LegalCheckbox from "@rbx/authentication-common/components/LegalCheckbox";
import {
  KoreaComplianceCheckboxType,
  KoreaComplianceCheckboxTypeMap,
} from "../utils/KoreaComplianceCheckboxUtil";

export type KoreaComplianceCheckboxProps = {
  locale: string;
  translate: WithTranslationsProps["translate"];
  isChecked: boolean;
  onCheckBoxChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkboxType: KoreaComplianceCheckboxType;
};

const KoreaComplianceCheckbox = ({
  locale,
  translate,
  isChecked,
  onCheckBoxChanged,
  checkboxType,
}: KoreaComplianceCheckboxProps): JSX.Element => {
  const checkboxProperties = KoreaComplianceCheckboxTypeMap[checkboxType];
  const legalText = checkboxProperties.text(translate, locale);

  return (
    <LegalCheckbox
      id={"compliance-privacy-policy-".concat(checkboxType.toString())}
      isChecked={isChecked}
      onCheckBoxChanged={onCheckBoxChanged}
      legalText={legalText}
    />
  );
};

export default KoreaComplianceCheckbox;
