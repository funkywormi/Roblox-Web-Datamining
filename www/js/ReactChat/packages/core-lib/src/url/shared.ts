import { Result, ok, err } from "../result";
import { downcast } from "../commonTypes";
import { arrayIncludes } from "../util";
import { UrlSearchParams } from "./searchParams";
import { Unique } from "./types";

/**
 * The error returned when a URL failed to be created.
 *
 * Possible error cases are:
 * - `ForbiddenScheme`: the scheme was not allowed for the URL type.
 * - `ForbiddenHost`: the host was not in the allowlist.
 */
export type CreateUrlErrorCause =
  | { readonly code: "ForbiddenScheme"; readonly scheme: string }
  | { readonly code: "ForbiddenHost"; readonly host: string };

/**
 * The error returned when a string failed to be parsed into a URL.
 *
 * Possible error cases are:
 * - `ForbiddenScheme`: the scheme was not allowed for the URL type.
 * - `ForbiddenHost`: the host was not in the allowlist.
 * - `InvalidUrl`: the string was not a valid url and could not be parsed.
 */
export type ParseUrlErrorCause = CreateUrlErrorCause | { readonly code: "InvalidUrl" };

const errorMessage = (cause: ParseUrlErrorCause) => {
  switch (cause.code) {
    case "ForbiddenScheme": {
      return `forbidden scheme: ${cause.scheme}`;
    }
    case "ForbiddenHost": {
      return `forbidden host: ${cause.host}`;
    }
    case "InvalidUrl": {
      return "invalid URL";
    }
  }
};

/**
 * The error returned when a URL failed to be created.
 *
 * Possible error cases are:
 * - `ForbiddenScheme`: the scheme was not allowed for the URL type.
 * - `ForbiddenHost`: the host was not in the allowlist.
 */
export class CreateUrlError extends Error {
  constructor(readonly cause: CreateUrlErrorCause) {
    super(errorMessage(cause), { cause });
  }
}

/**
 * The error returned when a string failed to be parsed into a URL.
 *
 * Possible error cases are:
 * - `ForbiddenScheme`: the scheme was not allowed for the URL type.
 * - `ForbiddenHost`: the host was not in the allowlist.
 * - `InvalidUrl`: the string was not a valid url and could not be parsed.
 */
export class ParseUrlError extends Error {
  constructor(readonly cause: ParseUrlErrorCause) {
    super(errorMessage(cause), { cause });
  }
}

// eslint-disable-next-line no-restricted-globals
export const cloneURL = (url: URL): Unique<URL> => downcast(new URL(url));

const parseURL = (url: string): Result<Unique<URL>, ParseUrlError> => {
  try {
    // eslint-disable-next-line no-restricted-globals
    return ok(downcast(new URL(url)));
  } catch {
    return err(new ParseUrlError({ code: "InvalidUrl" }));
  }
};

export type BaseUrlOptions = {
  readonly schemeAllowlist?: readonly `${string}:`[];
  readonly domainAllowlist?: readonly string[];
  readonly sanitize?: boolean;
};

const fromUniqueURL = <T>(
  url: Unique<URL>,
  { schemeAllowlist, domainAllowlist, sanitize }: Required<BaseUrlOptions>,
  constructor: (url: Unique<URL>, searchParams: UrlSearchParams) => T,
): Result<T, CreateUrlErrorCause> => {
  /* eslint-disable no-param-reassign */
  url.password = "";
  url.username = "";
  /* eslint-enable no-param-reassign */
  if (!arrayIncludes(schemeAllowlist, url.protocol)) {
    return err({ code: "ForbiddenScheme", scheme: url.protocol });
  }
  if (
    !domainAllowlist.some(domain =>
      domain.startsWith(".") ? url.hostname.endsWith(domain) : url.hostname === domain,
    )
  ) {
    return err({ code: "ForbiddenHost", host: url.host });
  }
  if (sanitize) {
    const searchParams = UrlSearchParams.fromURLSearchParams(url.searchParams);
    // eslint-disable-next-line no-param-reassign
    url.search = searchParams.toString();
    return ok(constructor(url, searchParams));
  }
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const searchParams = UrlSearchParams.internalFromUniqueURLSearchParams(
    downcast(url.searchParams),
  );
  return ok(constructor(url, searchParams));
};

export const fromURLWithRequiredOptions = <T>(
  url: URL,
  options: Required<BaseUrlOptions>,
  constructor: (url: Unique<URL>, searchParams: UrlSearchParams) => T,
): Result<T, CreateUrlError> =>
  fromUniqueURL(cloneURL(url), options, constructor).mapErr(cause => new CreateUrlError(cause));

export const parseWithRequiredOptions = <T>(
  url: string,
  options: Required<BaseUrlOptions>,
  constructor: (url: Unique<URL>, searchParams: UrlSearchParams) => T,
): Result<T, ParseUrlError> =>
  parseURL(url).andThen(url =>
    fromUniqueURL(url, options, constructor).mapErr(cause => new ParseUrlError(cause)),
  );
