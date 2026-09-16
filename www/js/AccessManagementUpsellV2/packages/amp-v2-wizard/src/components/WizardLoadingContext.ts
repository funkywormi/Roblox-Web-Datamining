import { createContext } from "react";

/** Loading state for node-owned portals, which cannot inherit the host's DOM interaction lock. */
export const WizardLoadingContext = createContext(false);
