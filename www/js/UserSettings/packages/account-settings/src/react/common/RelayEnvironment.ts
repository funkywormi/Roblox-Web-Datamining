import { Environment, Network, RecordSource, Store } from "relay-runtime";
// Persisted mutations go as POSTs, which the settings surface's updateUserSetting needs.
import { fetchFn } from "../settingsSurface/RelayEnvironment";

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
