import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import {
  buttonWidths,
  fuiButtonStyle,
  fullWidthClassName,
  TButtonWidth,
} from "../constants/buttonWidths";

type TLoadingButtonProps = {
  buttonClassName?: string;
  buttonWidth?: TButtonWidth;
};

// Loading state as an Emphasis button with FUI's built-in spinner (isLoading), matching the app —
// not a bare spinner. Same width/size classes as the resolved button so the box doesn't jump.
const LoadingButton = ({
  buttonClassName = "btn-common-play-game-lg",
  buttonWidth = buttonWidths.full,
}: TLoadingButtonProps) => (
  <Button
    data-testid="play-button-loading"
    variant="Emphasis"
    isLoading
    aria-label="Loading"
    style={fuiButtonStyle}
    className={classNames(fullWidthClassName(buttonWidth), buttonClassName)}
  />
);

export default LoadingButton;
