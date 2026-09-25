import { useEffect, useState } from "react";
import { AccountSwitcherService } from "Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { TLoggedInUsers } from "../types/accountSwitcherTypes";

type UseLoggedInUsersReturnType = {
  loggedInUsers: TLoggedInUsers;
  isGettingLoggedInUsers: boolean;
};

function useLoggedInUsers(shouldFetchUserInfo = true): UseLoggedInUsersReturnType {
  const [loggedInUsers, setLoggedInUsers] = useState<TLoggedInUsers>({
    usersAvailableForSwitching: [],
    isAccountLimitReached: false,
  });
  const [isGettingLoggedInUsers, setIsGettingLoggedInUsers] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const response = await AccountSwitcherService?.parseLoggedInUsers(
          !authenticatedUser.isAuthenticated,
          shouldFetchUserInfo,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setLoggedInUsers(response);
      } catch (error) {
        // TODO handle error here. We might want to add metrics and/or show error to users depending on what the backend returns.
        console.warn("account switching has issues", error);
      } finally {
        setIsGettingLoggedInUsers(false);
      }
    };
    // eslint-disable-next-line no-void
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loggedInUsers, isGettingLoggedInUsers };
}

export default useLoggedInUsers;
