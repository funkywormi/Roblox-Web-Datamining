import React from "react";
import { Checkbox } from "@rbx/foundation-ui";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";

type Props = {
  disabled: boolean;
  rememberDevice: boolean;
  setRememberDevice: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

/**
 * A check box for the user preference to remember a 2SV device.
 */
const RememberDeviceCheckBox: React.FC<Props> = ({
  disabled,
  rememberDevice,
  setRememberDevice,
  className,
}: Props) => {
  const {
    state: { resources },
  } = useTwoStepVerificationContext();

  return (
    <div
      className={`challenge-checkbox flex justify-center ${className ?? ""}`}
      data-testid="remember-device-checkbox"
    >
      <Checkbox
        size="Large"
        placement="Start"
        label={resources.Label.TrustThisDevice}
        isChecked={rememberDevice}
        isDisabled={disabled}
        onCheckedChange={isChecked => setRememberDevice(isChecked === true)}
      />
    </div>
  );
};

export default RememberDeviceCheckBox;
