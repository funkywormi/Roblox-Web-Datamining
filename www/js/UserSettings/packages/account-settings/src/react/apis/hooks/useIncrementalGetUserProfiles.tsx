import { useState, useEffect, useRef, useMemo } from "react";
import { useUserProfiles } from "@rbx/user-profile-api-client";
import UserProfileDetailsByUserId from "@rbx/user-profile-api-client/dist/types/UserProfileDetailsByUserId";
import UserProfileNameField from "@rbx/user-profile-api-client/dist/constants/UserProfileNameFieldEnum";

/**
 * A custom hook that fetches user profiles incrementally. It keeps a cached state
 * of all profiles fetched and only requests data for new user IDs that are introduced.
 *
 * This is necessary because the useUserProfile hook can only receive a batch of at most 250 profiles,
 * and we may paginate to 1000.
 * */

const PROFILE_FETCH_LIMIT = 200;

const useIncrementalUserProfiles = (
  ids: number[],
  fields: UserProfileNameField[],
): {
  data: UserProfileDetailsByUserId;
  loading: boolean;
} => {
  // Hold previously fetched profiles.
  const [allProfiles, setAllProfiles] = useState<UserProfileDetailsByUserId>({});

  // Queue of IDs that need to be fetched
  const [idsToFetch, setIdsToFetch] = useState<number[]>([]);
  const seenIdsRef = useRef(new Set<number>());

  // Queue new IDs that haven't been seen
  useEffect(() => {
    const newIds = ids.filter(id => !seenIdsRef.current.has(id));
    if (newIds.length === 0) {
      return;
    }

    newIds.forEach(id => seenIdsRef.current.add(id));
    setIdsToFetch(prev => [...prev, ...newIds]);
  }, [ids]);

  // Fetch the next batch
  const batchToFetch = useMemo(() => idsToFetch.slice(0, PROFILE_FETCH_LIMIT), [idsToFetch]);
  const { data: newlyFetchedProfiles, loading } = useUserProfiles(batchToFetch, fields);

  // Merge fetched profiles and remove from queue
  useEffect(() => {
    if (!loading && batchToFetch.length > 0) {
      if (newlyFetchedProfiles) {
        setAllProfiles(prev => ({ ...prev, ...newlyFetchedProfiles }));
      }
      // Remove the batch we attempted, whether or not all succeeded
      setIdsToFetch(prev => prev.slice(batchToFetch.length));
    }
  }, [newlyFetchedProfiles, loading, batchToFetch]);

  return { data: allProfiles, loading: loading || idsToFetch.length > 0 };
};

export default useIncrementalUserProfiles;
