import { dataStores, cryptoUtil } from "@rbx/core-scripts/legacy/core-roblox-utilities";

const { getHbaMeta } = cryptoUtil;

const hbaMeta = getHbaMeta();

const { hbaIndexedDBName, hbaIndexedDBObjStoreName, hbaIndexedDBKeyName } = hbaMeta;
const { hbacIndexedDB } = dataStores;

/**
 * Put CryptoKeyPairs to indexedDB
 *
 * @returns Promise<void>
 */
export const storeClientKeyPair = async (clientKeyPair: CryptoKeyPair): Promise<void> => {
  if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
    await hbacIndexedDB
      .putCryptoKeyPair(
        hbaIndexedDBName,
        hbaIndexedDBObjStoreName,
        hbaIndexedDBKeyName,
        clientKeyPair,
      )
      .catch(() => {
        console.error("putting cryptoKeyPair error");
      });
  }
};

export default {
  storeClientKeyPair,
};
