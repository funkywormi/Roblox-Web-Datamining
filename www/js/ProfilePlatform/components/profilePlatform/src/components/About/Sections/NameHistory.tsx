import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { About } from "@rbx/profile-platform";
import SectionHeader from "./SectionHeader";
import SectionContent from "./SectionContent";
import { SectionKeys } from "../../../constants/enums";

const NameHistory: React.FC<About> = ({ nameHistory }) => {
  const { translate } = useTranslation();
  return (
    <div key={SectionKeys.NameHistory} className="gap-small flex flex-col">
      <SectionHeader>{translate("Label.PreviousNames")}</SectionHeader>
      {nameHistory && nameHistory.length > 0 ? (
        <SectionContent>{nameHistory.join("; ")}</SectionContent>
      ) : (
        <div className="text-body-medium">{translate("Label.NoPreviousName")}</div>
      )}
    </div>
  );
};

export default NameHistory;
