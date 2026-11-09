import { createContext } from "react";

/**
 * Opts a subtree into profile frames for callers that can't pass
 * `includeProfileFrame` — e.g. `UserListDialog` in `@rbx/profile-platform`,
 * which renders our `Thumbnail2d` with no way to thread thumbnail options.
 * An explicit prop always wins; this is the fallback.
 */
export const ProfileFrameDefaultContext = createContext(false);
