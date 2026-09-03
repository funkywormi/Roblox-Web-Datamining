import { useContext } from "react";
import { SecurityTabContext } from "../store/contextProvider";

/**
 * A wrapper around `useContext` for the security tab state, which throws if the
 * context has not actually been provided in the current component scope.
 *
 * We could also check for `null` values wherever the context is used (and
 * return an empty component if necessary), but that would be a lot of cruft
 * for what should be a fatal error anyway.
 */
const useSecurityTabContext: () => SecurityTabContext = () => {
  const context = useContext(SecurityTabContext);
  if (context === null) {
    throw new Error("SecurityTabContext was not provided in the current scope");
  }
  return context;
};

export default useSecurityTabContext;
