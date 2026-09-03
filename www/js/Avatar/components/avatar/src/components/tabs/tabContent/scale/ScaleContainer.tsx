import React from "react";
import classNames from "classnames";
import { Scales, ScalesKeys } from "../../../../constants/types";
import AvatarScaling from "../../../AvatarScaling/AvatarScaling";
import { useAvatarTabsContext } from "../../../../contexts/AvatarTabsContext";
import { useAvatarPageContext } from "../../../../contexts/AvatarPageContext";

interface ScaleContainerProps {
  scales: Scales;
  updateScale: (newValue: number, scaleKey: ScalesKeys) => void;
}

function ScaleContainer({ scales, updateScale }: ScaleContainerProps): JSX.Element | null {
  const { selectedTab, selectedSubcategory } = useAvatarTabsContext();
  const { avatarSettings } = useAvatarPageContext();

  return avatarSettings?.isAvatarScaleEmbeddedInTab ? (
    <div
      className={classNames("tab-pane", "scaling-tab", {
        active: selectedTab?.name === "Body" && selectedSubcategory?.name === "Scale",
      })}
      id="scale"
    >
      <div className="section-content">
        <div>
          <AvatarScaling scales={scales} updateScale={updateScale} />
        </div>
      </div>
    </div>
  ) : null;
}

export default ScaleContainer;
