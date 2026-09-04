import { useEffect, useState } from "react";
import { getWebFriendsRenamePolicies } from "../services/guacService";

export const useRenameFriendsPolicy = () => {
  const [renameFriendsToConnections, setRenameFriendsToConnections] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getWebFriendsRenamePolicies()
      .then(result => {
        if (isMounted) {
          setRenameFriendsToConnections(result.renameFriendsToConnections);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRenameFriendsToConnections(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return renameFriendsToConnections;
};
