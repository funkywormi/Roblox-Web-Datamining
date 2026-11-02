import { EnvironmentUrls } from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import { TUserData, TUserResponse } from "../types/userTypes";

// Built per call so importing never parses EnvironmentUrls.
const getUsersApiUrl = (path: string): Url =>
  Url.parse(EnvironmentUrls.usersApi).getOrThrow().withPath(path);

// Responses are cast, not schema-validated, to match the previous Axios behavior.
const postForJson = async <T>(path: string, params: JsonSerializable): Promise<T> => {
  const result = await http.postUntyped(getUsersApiUrl(path), params, { credentials: "omit" });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return result.getOrThrow() as T;
};

export const postUsersInfo = async (userIds: string[]): Promise<TUserData[]> => {
  const { data } = await postForJson<TUserResponse>("/v1/users", { userIds });
  return data;
};

export default {
  postUsersInfo,
};
