import React from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { About } from "@rbx/profile-platform";
import SectionHeader from "./SectionHeader";
import { SectionKeys } from "../../../constants/enums";

const JoinDate: React.FC<About> = ({ joinDateTime }) => {
  const { translate } = useTranslation();

  if (!joinDateTime || joinDateTime === "") {
    return null;
  }

  const dateObject = new Date(joinDateTime);
  const formattedDate = dateObject.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  return (
    <div key={SectionKeys.JoinDateTime} className="gap-small flex flex-col">
      <SectionHeader>{translate("Heading.Statistics")}</SectionHeader>
      <div className="items-center gap-xsmall flex">
        <Icon name="icon-filled-circle-i" size="XSmall" />
        <span className="text-body-medium">
          {translate("Label.JoinDate")} {formattedDate}
        </span>
      </div>
    </div>
  );
};

export default JoinDate;
