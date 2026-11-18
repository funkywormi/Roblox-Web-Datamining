import * as z from "zod/mini";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";

export const getServerNonce = async (): Promise<string> => {
  const url = Url.parse(
    `${environmentUrls.apiGatewayUrl}/hba-service/v1/getServerNonce`,
  ).getOrThrow();
  const result = await http.get(url, z.string().check(z.minLength(1)), { credentials: "include" });
  return result.getOrThrow();
};
