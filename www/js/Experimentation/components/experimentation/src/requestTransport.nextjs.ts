import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { PostConfig } from "./requestTransport";

export const post = <T>(config: PostConfig, data: object): Promise<{ data: T }> =>
  Promise.resolve()
    .then(() =>
      http
        .postUntyped(
          Url.parse(config.url).getOrThrow(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          data as JsonSerializable,
          config.withCredentials ? { credentials: "include" } : {},
        )
        .getOrThrow(),
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    .then(body => ({ data: body as T }));
