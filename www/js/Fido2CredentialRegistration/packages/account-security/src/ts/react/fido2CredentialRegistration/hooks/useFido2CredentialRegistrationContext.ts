import { useContext } from "react";
import { Fido2CredentialRegistrationContext } from "../store/contextProvider";

/**
 * A wrapper around `useContext` for the security tab state, which throws if the
 * context has not actually been provided in the current component scope.
 *
 * We could also check for `null` values wherever the context is used (and
 * return an empty component if necessary), but that would be a lot of cruft
 * for what should be a fatal error anyway.
 */
const useFido2CredentialRegistrationContext: () => Fido2CredentialRegistrationContext = () => {
  const context = useContext(Fido2CredentialRegistrationContext);
  if (context === null) {
    throw new Error("Fido2CredentialRegistrationContext was not provided in the current scope");
  }
  return context;
};

export default useFido2CredentialRegistrationContext;
