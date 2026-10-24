import { createContext } from "react";

/** Loading state for node-owned portals, which cannot inherit the host's DOM interaction lock. */
export const WizardLoadingContext = createContext(false);

/**
 * True while the node sits behind one that presents over it. Full-page chrome stops being modal so
 * the presenting node's own UI (e.g. Persona on document.body) stays reachable.
 */
export const WizardBackgroundedContext = createContext(false);

/** True while the node is shown to the parent, whose screens drop the child's theme. */
export const WizardParentFacingContext = createContext(false);
