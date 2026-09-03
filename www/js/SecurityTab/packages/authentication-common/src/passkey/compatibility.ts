import { pipe } from "fp-ts/lib/function";
import * as TaskEither from "fp-ts/TaskEither";
import * as Task from "fp-ts/Task";

/**
 * Shared module for determining compatibility for various platform-specific features.
 */

export type PasskeyRelevantMeta = {
  isInApp: boolean;
  isIosApp: boolean;
  isAndroidApp: boolean;
};

// Take advantage of structural typing so we avoid making unit test setup excessively difficult.
export type PasskeyRelevantMetaProducer = () => PasskeyRelevantMeta;

export const defaultNotInApp = (): PasskeyRelevantMeta => ({
  isIosApp: false,
  isAndroidApp: false,
  isInApp: false,
});

export type PasskeyCompatibleProps = {
  producer?: PasskeyRelevantMetaProducer;
  hybridCallback: () => Promise<string | null>;
};

export const isPasskeyCompatible = ({
  // Sometimes `DeviceMeta`, the most common implementation of this callback is not defined.
  // We default to something that is always defined to simplify the containing logic.
  producer = defaultNotInApp,
  hybridCallback,
}: PasskeyCompatibleProps): Promise<boolean> => {
  const deviceMetadata = producer();
  const inApp = deviceMetadata.isInApp;
  const inWeb = !inApp;
  const hasPublicKeyCredential = typeof PublicKeyCredential !== "undefined";

  // Note; we should consider removing the `inWeb` predicate, because some webviews do support
  // PublicKeyCredential and we don't want to pre-emptively prune the support. But this is here
  // for parity with our existing implementations.
  if (inWeb && hasPublicKeyCredential) {
    return Promise.resolve(true);
  }

  const isIosOrAndroidApp = deviceMetadata.isIosApp || deviceMetadata.isAndroidApp;
  const canAttemptHybridFallback = inApp && isIosOrAndroidApp;
  if (!canAttemptHybridFallback) {
    return Promise.resolve(false);
  }

  return pipe(
    TaskEither.tryCatch(hybridCallback, e => e),
    TaskEither.map(response => response === "true"),
    TaskEither.getOrElse(() => Task.of(false)),
  )();
};
