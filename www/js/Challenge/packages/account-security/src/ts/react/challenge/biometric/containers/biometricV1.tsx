import React from "react";
import useBiometricContext from "../hooks/useBiometricContext";
import PersonaLivenessCheckV2 from "./personaLiveness/personaLivenessV2";

/**
 * This is the entry point for the biometric challenge.
 * It renders the appropriate container based on the biometric type.
 */
const BiometricV1: React.FC = () => {
  const {
    state: { biometricType },
  } = useBiometricContext();

  switch (biometricType) {
    case "personaliveness":
      return <PersonaLivenessCheckV2 />;
    default:
      console.error("Biometric type not supported:", biometricType);
      break;
  }

  return null;
};

export default BiometricV1;
