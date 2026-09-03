import React, { useEffect } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Slider } from "@rbx/foundation-ui";
import { Scales, ScalesKeys, isScalesWithBodyTypeAndProportion } from "../../constants/types";
import { useAvatarPageContext } from "../../contexts/AvatarPageContext";
import { useAvatarEditingAccessContext } from "../../contexts/AvatarEditingAccessContext";

export type AvatarBodyTypeScaleProps = {
  scales: Scales;
  updateScale: (newValue: number, scaleKey: ScalesKeys) => void;
};

function AvatarBodyTypeScale({ scales, updateScale }: AvatarBodyTypeScaleProps): JSX.Element {
  const { translate } = useTranslation();
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    setValue(scales.bodyType?.value || 0);
  }, [scales.bodyType?.value]);

  const { avatarSettings, pageLoaded, scaleEnabled } = useAvatarPageContext();
  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const isAvatarScaleEmbeddedInTab = avatarSettings?.isAvatarScaleEmbeddedInTab;
  const isScaleDisabled = !scaleEnabled || isAvatarEditingBlocked;

  if (!isAvatarScaleEmbeddedInTab) {
    return <React.Fragment />;
  }

  if (!isScalesWithBodyTypeAndProportion(scales)) {
    return <React.Fragment />;
  }

  const onChange = (values: number[]) => {
    setValue(values[0] ?? 0);
  };

  const onChangeCommitted = (values: number[]) => {
    updateScale(values[0] ?? 0, "bodyType");
  };

  const bodyTypePercentageValue = `${scales.bodyType.value || 0}%`;
  return (
    <div className="section-sliders">
      <div
        className={classNames("scale-container", {
          invisible: !pageLoaded,
        })}
      >
        <div className="text-label font-subheader-1">{translate(scales.bodyType.label)}</div>
        <div className="scale-label font-body">{bodyTypePercentageValue}</div>
        <Slider
          thumbAriaNames={["Body Type Scale"]}
          isDisabled={isScaleDisabled}
          step={scales.bodyType.increment}
          min={scales.bodyType.min}
          max={scales.bodyType.max}
          value={[value]}
          onValueChange={onChange}
          onValueCommit={onChangeCommitted}
        />
      </div>
    </div>
  );
}

export default AvatarBodyTypeScale;
