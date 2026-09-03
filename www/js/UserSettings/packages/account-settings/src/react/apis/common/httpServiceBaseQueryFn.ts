import type { BaseQueryApi, BaseQueryFn } from "@reduxjs/toolkit/query";
import { AccountIntegrityChallengeService } from "Roblox";
import { httpService } from "core-utilities";
import { ChallengeAbandonedError, UnknownError } from "@rbx/user-settings";

export enum HttpMethod {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
  PATCH = "patch",
}

export type TBaseQueryArgs = {
  url: string;
  method?: HttpMethod;
  queryParams?: URLSearchParams | Record<string, any> | null;
  postBody?: Document | BodyInit | Record<string, any> | null;
  withCredentials?: boolean;
  meta?: {};
  headers?: Record<string, string>;
};

enum ApiRequestType {
  QUERY = "query",
  MUTATION = "mutation",
}

/**
 * RTK defines a query and mutation property which is assigned to each endpoint.
 * Typically queries represent GET operations, and mutations represent POST
 * operations. This convention is used to determine default HttpMethod where it
 * is not explicitly provided by the implementing endpoint.
 *
 * @param api see baseQueryFn below
 * @returns HttpMethod
 */
const defaultMethod = (api: BaseQueryApi) => {
  return api.type === ApiRequestType.MUTATION ? HttpMethod.POST : HttpMethod.GET;
};

/**
 * paramsSanityCheck is a helper function that checks if the provided arguments
 * are matched with http request method. This is a helper function to ensure
 * that only GET and DELETE methods are allowed to have queryParams, and only
 * POST, PUT, and PATCH methods are allowed to have postBody.
 */
const paramsSanityCheck = (args: TBaseQueryArgs, method: HttpMethod) => {
  let data: Document | BodyInit | Record<string, any> | null | undefined;
  if (method === HttpMethod.GET || method === HttpMethod.DELETE) {
    data = args.queryParams;
  } else {
    data = args.postBody;
  }
  return data;
};

/**
 * CustomBaseQuery Function that is invoked to resolve a request. This function
 * uses the httpService to resolve requests. This method is intended to
 * generically capture the functionality exposed by httpService. It's up to the
 * caller to ensure they pass the correct configuration according to
 * TBaseQueryArgs for any request.
 *
 * @param args arguments passed by individual endpoints defined in a slice. This
 * is typically the return value of the query function on an endpoint.
 * @param api provides a means to interact with the redux store.
 * @returns a promise containing an object of the form...
 * interface Response<T> {
 *   data?: T;
 *   error?: unknown
 * }
 *
 * NOTE: that only one of data || error field is present depending on whether or
 * not the response succeeded.
 */
export const httpBaseQueryFn: BaseQueryFn = (args: TBaseQueryArgs, api: BaseQueryApi) => {
  const method = args?.method || defaultMethod(api);
  const requestFn = httpService[method];

  // We want to avoid attaching post body as query params.
  // httpService will merge the url config and data into a single object.

  const urlConfig: TBaseQueryArgs = {
    // withCredentials defaults to true, unless overriden by caller
    withCredentials: args?.withCredentials === undefined ? true : args.withCredentials,
    url: args.url,
  };

  if (args.headers) {
    urlConfig.headers = args.headers;
  }

  const data = paramsSanityCheck(args, method);

  return requestFn(urlConfig, data as any)
    .then(res => ({ data: res.data, meta: args.meta }))
    .catch(error => {
      // https://roblox.atlassian.net/browse/ACCMAN-2037: Investigate empty error responses won't get caught
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorMessage = error ?? UnknownError;
      if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
        return { error: ChallengeAbandonedError, meta: args.meta };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { error: errorMessage, meta: args.meta };
    });
};
