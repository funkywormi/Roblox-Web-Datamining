import { setRealtimeHttpTransport } from "@rbx/www-common/realtime/http-transport";
import type { RealtimeUrlConfig } from "@rbx/www-common/realtime/http-transport";
import { get, post } from "../http";

// NEXT_PUBLIC_IS_NEXTJS is inlined by Next at build; undefined in the .NET Rspack build and under
// jest. .NET keeps axios (CSRF/retry/Sentry built in); Next keeps the core-lib default.
if (process.env.NEXT_PUBLIC_IS_NEXTJS !== "true") {
  setRealtimeHttpTransport({
    get: async <T>(config: RealtimeUrlConfig) => (await get<T>(config)).data,
    post: async <T>(config: RealtimeUrlConfig, data?: object) => (await post<T>(config, data)).data,
  });
}
