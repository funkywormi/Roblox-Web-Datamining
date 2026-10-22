import React from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import useBiometricContext from "../../hooks/useBiometricContext";

function LoadingPage(): React.ReactElement {
  const {
    state: { resources },
  } = useBiometricContext();

  return (
    <div className="flex justify-center">
      <ProgressCircle
        variant="Indeterminate"
        size="Small"
        ariaLabel={resources.personaLiveness.loading}
      />
    </div>
  );
}
export default LoadingPage;
