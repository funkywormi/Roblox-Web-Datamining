import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";

type DisplayNamesPolicyResponse = {
  RealNamesInDisplayNamesEnabled: boolean;
};

const STORAGE_KEY = `editUserProfile.displayNamesPolicy.${authenticatedUser()?.id ?? 0}`;

const readCachedPolicy = (): boolean | undefined => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "boolean" ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const writeCachedPolicy = (value: boolean): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore failures
  }
};

const fetchDisplayNamesPolicy = async (): Promise<boolean> => {
  const guacData = await callBehaviour<DisplayNamesPolicyResponse>("display-names");
  return guacData.RealNamesInDisplayNamesEnabled;
};

const useAgedUpDisplayNames = (): boolean => {
  const { data: hasAgedUpDisplayNames = false } = useQuery({
    queryKey: ["displayNamesPolicy"],
    queryFn: fetchDisplayNamesPolicy,
    initialData: readCachedPolicy,
    onSuccess: writeCachedPolicy,
  });

  return hasAgedUpDisplayNames;
};

export default useAgedUpDisplayNames;
