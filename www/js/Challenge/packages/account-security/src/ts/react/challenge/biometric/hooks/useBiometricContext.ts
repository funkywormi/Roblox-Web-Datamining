import { useContext } from "react";
import { BiometricContext } from "../store/contextProvider";

const useBiometricContext: () => BiometricContext = () => {
  const context = useContext(BiometricContext);
  if (context === null) {
    throw new Error("BiometricContext was not provided in the current scope");
  }

  return context;
};

export default useBiometricContext;
