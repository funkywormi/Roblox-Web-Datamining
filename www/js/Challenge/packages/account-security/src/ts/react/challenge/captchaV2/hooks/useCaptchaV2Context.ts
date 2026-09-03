import { useContext } from "react";
import { CaptchaV2Context } from "../store/contextProvider";

const useCaptchaV2Context: () => CaptchaV2Context = () => {
  const context = useContext(CaptchaV2Context);
  if (context === null) {
    throw new Error("CaptchaV2Context was not provided in the current scope");
  }

  return context;
};

export default useCaptchaV2Context;
