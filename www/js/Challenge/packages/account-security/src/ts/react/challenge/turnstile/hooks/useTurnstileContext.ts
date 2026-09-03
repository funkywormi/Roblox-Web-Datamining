import { useContext } from "react";
import { TurnstileContext } from "../store/contextProvider";

const useTurnstileContext: () => TurnstileContext = () => {
  const context = useContext(TurnstileContext);
  if (context === null) {
    throw new Error("TurnstileContext was not provided in the current scope");
  }

  return context;
};

export default useTurnstileContext;
