import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { UniversalFeatureRestrictionsHttp } from "@rbx/universal-feature-restrictions";

const nextjs: UniversalFeatureRestrictionsHttp = {
  httpGet: <T>(url: string): Promise<T> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    http
      .getUntyped(Url.parse(url).getOrThrow(), { credentials: "include" })
      .getOrThrow() as unknown as Promise<T>,
  httpPost: async (url: string, body: object): Promise<void> => {
    await http
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      .postUntyped(Url.parse(url).getOrThrow(), body as JsonSerializable, {
        credentials: "include",
      })
      .getOrThrow();
  },
};

export default nextjs;
