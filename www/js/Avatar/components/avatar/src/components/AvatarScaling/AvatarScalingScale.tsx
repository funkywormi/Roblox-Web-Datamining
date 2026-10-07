import React, { useEffect } from "react";
import classNames from "classnames";
import { useAvatarTranslate } from "../../utils/translate";
import { Slider } from "@rbx/foundation-ui";
import { ScalesKeys, Scale } from "../../constants/types";

export type AvatarScalingScaleProps = {
  scaleKey: ScalesKeys;
  scale: Scale;
  updateScale: (newValue: number, scaleKey: ScalesKeys) => void;
  pageLoaded: boolean;
  isBodyTypeScaleOutOfTab: boolean;
  scaleEnabled: boolean;
};

function AvatarScalingScale({
  scaleKey,
  scale,
  updateScale,
  pageLoaded,
  isBodyTypeScaleOutOfTab,
  scaleEnabled,
}: AvatarScalingScaleProps): JSX.Element {
  const translate = useAvatarTranslate("Feature.Avatar");
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    setValue(scale.value || 0);
  }, [scale.value]);

  const onChange = (values: number[]) => {
    setValue(values[0] ?? 0);
  };

  const onChangeCommitted = (values: number[]) => {
    updateScale(values[0] ?? 0, scaleKey);
  };

  return (
    <div
      className={classNames("scale-container", {
        invisible: !pageLoaded,
      })}
    >
      {!isBodyTypeScaleOutOfTab || scale.type !== "BodyType" ? (
        <React.Fragment>
          <div className="text-label font-subheader-1">{translate(scale.label)}</div>
          <div className="scale-label font-body">{`${scale.value.toFixed(0)}%`}</div>
          <Slider
            thumbAriaNames={["Scale"]}
            isDisabled={!scaleEnabled}
            step={scale.increment}
            min={scale.min}
            max={scale.max}
            value={[value]}
            onValueChange={onChange}
            onValueCommit={onChangeCommitted}
          />
        </React.Fragment>
      ) : null}
    </div>
  );
}

export default AvatarScalingScale;
