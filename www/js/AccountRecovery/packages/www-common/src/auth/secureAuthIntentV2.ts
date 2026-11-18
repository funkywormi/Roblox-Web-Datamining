import * as boolean from "fp-ts/boolean";
import * as Either from "fp-ts/Either";
import * as TaskEither from "fp-ts/TaskEither";
import * as Option from "fp-ts/Option";
import {
  getWithDefaultHandlers,
  putWithDefaultHandlers,
  tryGetIndexedDBConnectionWithDefaults,
} from "@rbx/buffered-telemetry";
import { getDeviceMeta } from "../device/getDeviceClient";
import { hbaMeta as readHbaMeta } from "./hba";
import { generateSigningKeyPairUnextractable, exportPublicKeyAsSpki, sign } from "./crypto";
import { getServerNonce } from "./internal/hbaService";
import { deleteCryptoDB } from "./internal/indexedDB";
import { sendSAIMissingEvent, sendSAISuccessEvent } from "./internal/events";
import type { HbaMeta, SecureAuthIntent } from "./internal/types";
import { getErrorMessage } from "./internal/errorMessage";

// Read once on first use so flag results stay stable on the same page load.
let stableHbaMeta: HbaMeta | null = null;
const defaultHbaMeta = (): HbaMeta => {
  stableHbaMeta ??= readHbaMeta();
  return stableHbaMeta;
};

const SEPARATOR = "|";
const SAI_INSTRUMENTATION_NAME = "saiIndexedDb";

export const putIfAbsentWithObjectStoreRecovery = async ({
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  hbaIndexedDBVersion,
}: HbaMeta): Promise<Either.Either<{ message: string }, CryptoKeyPair>> => {
  const getConnectionThunk = (failWithIdentifier: string) =>
    Either.fromOption(() => ({ message: failWithIdentifier }))(
      tryGetIndexedDBConnectionWithDefaults({
        databaseName: hbaIndexedDBName,
        objectStoreName: hbaIndexedDBObjStoreName,
        version: hbaIndexedDBVersion,
        instrumentationName: SAI_INSTRUMENTATION_NAME,
      }),
    );

  const maybeIndexedDBConnection = getConnectionThunk("IndexedDBUnavailable");

  if (Either.isLeft(maybeIndexedDBConnection)) {
    return Either.left(maybeIndexedDBConnection.left);
  }

  const currentConnection = await maybeIndexedDBConnection.right;
  const containsHbaObjectStore =
    currentConnection.objectStoreNames.contains(hbaIndexedDBObjStoreName);

  if (!containsHbaObjectStore) {
    currentConnection.close();
    await deleteCryptoDB(hbaIndexedDBName);
  }

  const maybeIndexedDBConnectionSecondAttempt = boolean.match(
    () => getConnectionThunk("ObjectStoreRecoveryFailed"),
    () => Either.right(Promise.resolve(currentConnection)),
  )(containsHbaObjectStore);

  if (Either.isLeft(maybeIndexedDBConnectionSecondAttempt)) {
    return Either.left(maybeIndexedDBConnectionSecondAttempt.left);
  }

  const indexedDBConnection = await maybeIndexedDBConnectionSecondAttempt.right;
  const maybeExistingClientKeyPairRequest = getWithDefaultHandlers<
    CryptoKeyPair | undefined | null
  >({
    database: indexedDBConnection,
    objectStoreName: hbaIndexedDBObjStoreName,
    key: hbaIndexedDBKeyName,
    instrumentationName: SAI_INSTRUMENTATION_NAME,
  });

  // A none here means the object store did not exist somehow even though we recovered above.
  if (Option.isNone(maybeExistingClientKeyPairRequest)) {
    return Either.left({ message: "ObjectStoreMissingEvenAfterRecovery" });
  }

  const maybeExistingClientKeyPair = await maybeExistingClientKeyPairRequest.value;
  if (maybeExistingClientKeyPair !== undefined && maybeExistingClientKeyPair !== null) {
    // Happy path, return early!
    return Either.right(maybeExistingClientKeyPair);
  }

  const newClientKeyPair = await TaskEither.tryCatch(
    () => generateSigningKeyPairUnextractable(),
    e => e,
  )();

  if (Either.isLeft(newClientKeyPair)) {
    return Either.left({ message: "NewSigningKeyGenerationFailed" });
  }

  const maybeStored = putWithDefaultHandlers({
    database: indexedDBConnection,
    objectStoreName: hbaIndexedDBObjStoreName,
    key: hbaIndexedDBKeyName,
    value: newClientKeyPair.right,
    instrumentationName: SAI_INSTRUMENTATION_NAME,
  });

  if (Option.isNone(maybeStored) || !(await maybeStored.value)) {
    return Either.left({ message: "NewSigningKeyPersistenceFailed" });
  }

  return newClientKeyPair;
};

/**
 * Build signup & login request with SecureAuthIntent
 *
 * @returns an auth request parameter
 */
export const generateSecureAuthIntent = async (
  hbaMetadata: HbaMeta = defaultHbaMeta(),
): Promise<SecureAuthIntent | null> => {
  try {
    if (!hbaMetadata.isSecureAuthenticationIntentEnabled || getDeviceMeta().isInApp) {
      return null;
    }

    const maybeServerNonce = await TaskEither.tryCatch(
      () => getServerNonce(),
      e => e,
    )();

    if (Either.isLeft(maybeServerNonce)) {
      console.warn("No hba server nonce available.");
      sendSAIMissingEvent({ message: "NonceUnavailable" });
      return null;
    }

    const maybeClientKeyPair = await putIfAbsentWithObjectStoreRecovery(hbaMetadata);
    if (Either.isLeft(maybeClientKeyPair)) {
      sendSAIMissingEvent(maybeClientKeyPair.left);
      return null;
    }

    const maybeExportedKey = await TaskEither.tryCatch(
      () => exportPublicKeyAsSpki(maybeClientKeyPair.right.publicKey),
      e => e,
    )();
    if (Either.isLeft(maybeExportedKey)) {
      sendSAIMissingEvent({ message: "ExportClientKeyFailed" });
      return null;
    }

    const clientEpochTimestamp = Math.floor(Date.now() / 1000);
    const payload = [maybeExportedKey.right, clientEpochTimestamp, maybeServerNonce.right].join(
      SEPARATOR,
    );

    const saiSignature = await sign(maybeClientKeyPair.right.privateKey, payload);
    const secureAuthIntent = {
      clientPublicKey: maybeExportedKey.right,
      clientEpochTimestamp,
      serverNonce: maybeServerNonce.right,
      saiSignature,
    };
    sendSAISuccessEvent();
    return secureAuthIntent;
  } catch (e) {
    sendSAIMissingEvent({ message: getErrorMessage(e) });
    return null;
  }
};
