import { createContext, useContext } from "react";
import { authenticatedUser, type AuthenticatedUser } from "@rbx/core-scripts/meta/user";

/**
 * The signed-in user as the host knows it at render time. Next.js provides it from the request so
 * the server and the first client render agree; without a provider (.NET) the meta tag is read.
 */
export const NavUserContext = createContext<AuthenticatedUser | null | undefined>(undefined);

export const useNavUser = (): AuthenticatedUser | null => {
  const user = useContext(NavUserContext);
  return user === undefined ? authenticatedUser() : user;
};
