import "../global";
import "../event-stream";
import * as E from "fp-ts/Either";
import * as boundAuth from "@rbx/www-common/auth";
import type { UrlConfig } from "../http";
import { isAuthenticated } from "../meta/user";
import { hbaMeta } from "./hba";
import { BatGenerationErrorInfo, HbaMeta } from "./internal/types";

// .NET wrapper over @rbx/www-common/auth: supplies the meta-tag HBA config (so web-platform settings
// still apply here) and the signed-in state.

// Module-level so flag results stay stable between requests on the same page load.
const defaultStableHbaMeta = hbaMeta();

export type UrlConfigForBat = Pick<
  UrlConfig,
  "url" | "method" | "withCredentials" | "headers" | "data"
>;

export const shouldRequestWithBoundAuthToken = (
  urlConfig: UrlConfig,
  hbaMetadata: HbaMeta,
): E.Either<BatGenerationErrorInfo, true> =>
  boundAuth.shouldRequestWithBoundAuthToken(urlConfig, hbaMetadata, isAuthenticated());

export const { getWithDisasterRecovery } = boundAuth;

export const generateBoundAuthToken = (
  urlConfig: UrlConfigForBat,
  hbaMetadata: HbaMeta = defaultStableHbaMeta,
): Promise<E.Either<BatGenerationErrorInfo, string>> =>
  boundAuth.generateBoundAuthToken(urlConfig, hbaMetadata);

export const buildConfigBoundAuthToken = (
  urlConfig: UrlConfigForBat,
  hbaMetadata: HbaMeta = defaultStableHbaMeta,
): Promise<UrlConfig> =>
  boundAuth.buildConfigBoundAuthToken(urlConfig, isAuthenticated(), hbaMetadata);
