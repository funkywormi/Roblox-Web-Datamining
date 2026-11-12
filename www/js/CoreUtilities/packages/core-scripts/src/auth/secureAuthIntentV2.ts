import type * as Either from "fp-ts/Either";
import * as sai from "@rbx/www-common/auth/sai-v2";
import { hbaMeta } from "./hba";
import { SecureAuthIntent } from "./internal/types";

// .NET wrapper over @rbx/www-common/auth/sai-v2: supplies the meta-tag HBA config so web-platform settings
// still apply here.

// Module-level so flag results stay stable on the same page load.
const defaultStableHbaMeta = hbaMeta();

export const putIfAbsentWithObjectStoreRecovery = (): Promise<
  Either.Either<{ message: string }, CryptoKeyPair>
> => sai.putIfAbsentWithObjectStoreRecovery(defaultStableHbaMeta);

export const generateSecureAuthIntent = (): Promise<SecureAuthIntent | null> =>
  sai.generateSecureAuthIntent(defaultStableHbaMeta);

export default { putIfAbsentWithObjectStoreRecovery };
