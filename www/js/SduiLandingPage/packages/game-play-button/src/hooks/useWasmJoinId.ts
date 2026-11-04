import { useQuery } from "@tanstack/react-query";
import { createWasmHash } from "@rbx/wasm-hash";
import { getCurrentUser } from "@rbx/www-common/user";

export const WASM_JOIN_ID_QUERY_KEY = "wasmJoinId";

/**
 * Computes the current user's WASM join hash.
 * This happens asynchronously and will be undefined while being computed.
 */
const useWasmJoinId = (): string | undefined => {
  const userId = getCurrentUser()?.id;
  const { data } = useQuery({
    queryKey: [WASM_JOIN_ID_QUERY_KEY, userId],
    queryFn: () => (userId == null ? Promise.resolve(null) : createWasmHash({ userId })),
    enabled: userId != null,
    staleTime: Infinity,
    retry: false,
  });
  return data ?? undefined;
};

export default useWasmJoinId;
