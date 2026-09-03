import React from "react";
import classNames from "classnames";
import BodyColors from "./BodyColors";
import { useAvatarTabsContext } from "../../../../contexts/AvatarTabsContext";

function BodyColorsContainer(): JSX.Element {
  const { selectedTab, selectedSubcategory } = useAvatarTabsContext();

  return (
    <div
      className={classNames("tab-pane", {
        active: selectedTab?.name === "Body" && selectedSubcategory?.name === "BodyColors",
      })}
      id="bodyColors"
    >
      <BodyColors />
    </div>
  );
}

export default BodyColorsContainer;
