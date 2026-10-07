import "../global";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import {
  getWithDefaultHandlers,
  tryGetIndexedDBConnectionWithDefaults,
} from "@rbx/buffered-telemetry";
import type { UrlConfig } from "../http";
import { hbaMeta } from "./hba";
import { BatGenerationErrorInfo, BatGenerationErrorKind, HbaMeta } from "./internal/types";
import { hashStringWithSha256, sign } from "./crypto";
import { ONE_MILLION, sendBATMissingEvent, sendBATSuccessEvent } from "./internal/events";
import { getErrorMessage } from "./internal/errorMessage";
import { putCryptoKeyPair } from "./internal/indexedDB";

// This remains module-level so that flag results remain stable between requests on the
// same page load, but is overridable in exported function definitions to make things easier
// to test.
const defaultStableHbaMeta = hbaMeta();

const SEPARATOR = "|";
const allowedHosts = [".roblox.com", ".robloxlabs.com", ".roblox.qq.com"];

const BAT_INSTRUMENTATION_NAME = "batIndexedDb";
const sampledIdbTelemetry = () =>
  Math.random() * ONE_MILLION < defaultStableHbaMeta.batEventSampleRate;

// Explicitly define the properties that different HTTP clients should forward from their config
// objects. Non-standard clients should hopefully break this in an obvious way.
export type UrlConfigForBat = Pick<
  UrlConfig,
  "url" | "method" | "withCredentials" | "headers" | "data"
>;

const getHost = (urlStr: string): string => {
  try {
    // URL has been polyfilled for IE
    const loc = new URL(urlStr);
    return loc.hostname;
  } catch {
    return "";
  }
};

// intentionally keep the urlConfig instead of url string as param for browser debugging purpose
const isUrlFromAllowedHost = (urlConfig: UrlConfig): boolean => {
  const host = getHost(urlConfig.url);
  return allowedHosts.some(allowedHost => host.endsWith(allowedHost));
};

let clientCryptoKeyPair: CryptoKeyPair | null = null;

/**
 * Check if a request should attach a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A boolean or error info.
 */
export const shouldRequestWithBoundAuthToken = (
  urlConfig: UrlConfig,
  hbaMeta: HbaMeta,
): E.Either<BatGenerationErrorInfo, true> => {
  const {
    isBoundAuthTokenEnabled,
    hbaIndexedDBName,
    hbaIndexedDBObjStoreName,
    hbaIndexedDBKeyName,
  } = hbaMeta;
  try {
    if (!window.Roblox.CurrentUser) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: "NoCurrentUser" });
    }

    if (!window.Roblox.CurrentUser.isAuthenticated) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "CurrentUserNotAuthenticated",
      });
    }

    if (!isUrlFromAllowedHost(urlConfig)) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "UrlNotFromAllowedHost",
      });
    }

    if (!hbaIndexedDBName) {
      return E.left({ kind: BatGenerationErrorKind.RequestExempt, message: "EmptyIndexedDbName" });
    }

    if (!hbaIndexedDBObjStoreName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "EmptyIndexedDbObjectStoreName",
      });
    }

    if (!hbaIndexedDBKeyName) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "EmptyIndexedDbKeyName",
      });
    }

    if (!isBoundAuthTokenEnabled) {
      return E.left({
        kind: BatGenerationErrorKind.RequestExempt,
        message: "BoundAuthTokenNotEnabled",
      });
    }

    return E.right(true);
  } catch (e) {
    return E.left({ kind: BatGenerationErrorKind.RequestExemptError, message: getErrorMessage(e) });
  }
};

export const getWithDisasterRecovery = async (
  databaseName: string,
  objectStoreName: string,
  version: number,
  key: string,
  useNewPath: boolean,
): Promise<CryptoKeyPair | null> => {
  if (!useNewPath) return null;
  const maybeConnection = tryGetIndexedDBConnectionWithDefaults({
    databaseName,
    objectStoreName,
    version,
    instrumentationName: BAT_INSTRUMENTATION_NAME,
    withTelemetry: sampledIdbTelemetry(),
  });

  if (O.isNone(maybeConnection)) {
    // Already instrumented internally by default.
    return null;
  }
  const connection = await maybeConnection.value;
  const maybeKey = getWithDefaultHandlers<CryptoKeyPair>({
    database: connection,
    objectStoreName,
    key,
    instrumentationName: BAT_INSTRUMENTATION_NAME,
    withTelemetry: sampledIdbTelemetry(),
  });
  if (O.isNone(maybeKey)) {
    connection.close();
    return null;
  }

  connection.close();
  return maybeKey.value;
};

/**
 * Generate a bound auth token or return error info.
 *
 * @param {UrlConfig} urlConfig
 * @returns A bound auth token or error info.
 */
export const generateBoundAuthToken = async (
  urlConfig: UrlConfigForBat,
  hbaMeta: HbaMeta = defaultStableHbaMeta,
): Promise<E.Either<BatGenerationErrorInfo, string>> => {
  try {
    const { hbaIndexedDBName, hbaIndexedDBObjStoreName, hbaIndexedDBKeyName, hbaIndexedDBVersion } =
      hbaMeta;

    if (clientCryptoKeyPair === null) {
      // Flagged internally in getWithDisasterRecovery.
      const maybeNewPair = await getWithDisasterRecovery(
        hbaIndexedDBName,
        hbaIndexedDBObjStoreName,
        hbaIndexedDBVersion,
        hbaIndexedDBKeyName,
        true,
      );
      clientCryptoKeyPair = maybeNewPair;
    } else {
      try {
        await putCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName,
          clientCryptoKeyPair,
        );
      } catch (e) {
        // Don't block the request if `updateKeyForCryptoKeyPair` rejects.
        return E.left({
          message: getErrorMessage(e),
          kind: BatGenerationErrorKind.UpdateKeyPairFailed,
        });
      }
    }
    // If no key is found, return empty.
    if (!clientCryptoKeyPair) {
      return E.left({
        message: "",
        kind: BatGenerationErrorKind.NoKeyPairFound,
      });
    }

    // Compute BAT timestamp.
    const clientEpochTimestamp = Math.floor(Date.now() / 1000).toString();

    // Hash request body.
    let strToHash: string;
    if (typeof urlConfig.data === "object") {
      strToHash = JSON.stringify(urlConfig.data);
    } else if (typeof urlConfig.data === "string") {
      strToHash = urlConfig.data;
    }

    let requestBodyHash = "";
    try {
      // @ts-expect-error TODO: old, migrated code
      requestBodyHash = await hashStringWithSha256(strToHash);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.RequestBodyHashFailed,
      });
    }

    // Derive RequestURL and method.
    const fullRequestUrl = urlConfig.url;
    const requestMethod = (urlConfig.method ?? "").toUpperCase();
    const requestPath = new URL(urlConfig.url).pathname;

    // Construct 2 payloads to sign, one with a null request body hash.
    // The payload components follow the V1 signature schema.
    const signature1payload = [
      requestBodyHash,
      clientEpochTimestamp,
      fullRequestUrl,
      requestMethod,
    ].join(SEPARATOR);
    const signature2payload = ["", clientEpochTimestamp, requestPath, requestMethod].join(
      SEPARATOR,
    );

    // Generate BAT signature.
    let signature1 = "";
    let signature2 = "";
    try {
      [signature1, signature2] = await Promise.all([
        sign(clientCryptoKeyPair.privateKey, signature1payload),
        sign(clientCryptoKeyPair.privateKey, signature2payload),
      ]);
    } catch (e) {
      return E.left({
        message: getErrorMessage(e),
        kind: BatGenerationErrorKind.SignatureFailed,
      });
    }

    const batSignatureVersion = "v1";

    // Construct Bound Authentication Token with format:
    // version | RequestBodyHash | Timestamp | Signature1 (| Signature2)?
    // - Signature1: always present, includes RBH in signed payload
    // - Signature2: optional, excludes RBH (used when request body is unavailable, e.g. Public Gateway requests)
    return E.right(
      [batSignatureVersion, requestBodyHash, clientEpochTimestamp, signature1, signature2].join(
        SEPARATOR,
      ),
    );
  } catch (e) {
    console.warn("BAT generation error:", e);
    return E.left({
      message: getErrorMessage(e),
      kind: BatGenerationErrorKind.Unknown,
    });
  }
};

/**
 * Build a urlconfig with Bound Auth Token
 *
 * @param {UrlConfig} urlConfig
 * @returns a urlConfig with bound auth token attached in the header
 */
export const buildConfigBoundAuthToken = async (
  urlConfig: UrlConfigForBat,
  // Overrideable for unit testing...
  hbaMetadata: HbaMeta = defaultStableHbaMeta,
): Promise<UrlConfig> => {
  const shouldRequestTrueOrError = shouldRequestWithBoundAuthToken(urlConfig, hbaMetadata);
  if (E.isLeft(shouldRequestTrueOrError)) {
    sendBATMissingEvent(
      urlConfig.url,
      shouldRequestTrueOrError.left,
      hbaMetadata.batEventSampleRate,
    );
    return urlConfig;
  }

  // step 1 call generateBoundAuthToken
  const errorOrBatString = await generateBoundAuthToken(urlConfig, hbaMetadata);

  // step 2 attach it to the header of the request
  const config = { ...urlConfig };
  if (E.isRight(errorOrBatString)) {
    config.headers = {
      ...config.headers,
      "x-bound-auth-token": errorOrBatString.right,
    };
    sendBATSuccessEvent(urlConfig.url, hbaMetadata.batEventSampleRate);
  } else {
    sendBATMissingEvent(urlConfig.url, errorOrBatString.left, hbaMetadata.batEventSampleRate);
  }

  return config;
};
