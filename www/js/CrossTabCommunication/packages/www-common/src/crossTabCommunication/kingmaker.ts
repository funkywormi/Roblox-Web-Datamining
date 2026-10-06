// Raw localStorage on purpose: keys and values are a wire format shared with other tabs.
/* eslint-disable no-restricted-globals */
import { subscribe, publish, isAvailable } from "./pubSub";

const namespaceForEvents = "Roblox.CrossTabCommunication.Kingmaker";
const keys = {
  masterId: `${namespaceForEvents}.masterId`,
  electionInProgress: `${namespaceForEvents}.electionInProgress`,
  masterIdRequest: `${namespaceForEvents}.masterIdRequest`,
  masterIdResponse: `${namespaceForEvents}.masterIdResponse`,
  masterLastResponseTime: `${namespaceForEvents}.masterLastResponseTime`,
};

const masterIdRequestValue = "q";
let masterNodeReply = "";
let masterTabId: string | null = null;
let isThisTabMaster = false;
let unloadListener: (() => void) | null = null;

let masterNodeMonitorTimer: number | null = null;
let masterLastResponseTime = Date.now() - 10000;
const masterIdleTimeBuffer = 2500;
// Whenever the master node is polled, it sets the time it responded into a localstorage key.
// When a new tab comes up, it checks this key and if the last time a master node responded to a query was > X seconds, it declares itself as the master immediately.
const masterLastResponseTimeThreshold = 20000;

const randomNumber = Math.floor(Math.random() * 100 + 1);
const monitorMasterNodeInterval = 2000 + randomNumber;
const waitIntervalForMasterHeartBeat = 1500 + randomNumber;
const electionDuration = 400 + randomNumber;
const electionDetailsPurgeInterval = 500;

// Copied from Stackoverflow.
const generateUUID = () => {
  let d = Date.now();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const tabId = generateUUID();
const electionListeners: ((isMaster: boolean) => void)[] = [];
const loggers: ((message: string) => void)[] = [];

const log = (message: string) => {
  for (const logger of loggers) {
    try {
      logger(message);
    } catch {
      /* empty */
    }
  }
};

const logMaster = () => {
  log(`Master is: ${masterTabId}`);
};

const timestamp = () => Date.now().toString();

// This callback is raised so that the tabs can know the final result of whether they were chosen as a master or a slave
const announceElectionResults = (isMaster: boolean) => {
  log(`Announcing: Is this tab the master? ${isMaster}`);
  for (const listener of electionListeners) {
    try {
      listener(isMaster);
    } catch (e) {
      log(`Error running subscribed election result handler: ${JSON.stringify(e)}`);
    }
  }
};

const declareThisTabAsMaster = () => {
  log(`Declaring myself as the master ${masterTabId}`);
  masterTabId = tabId;
  isThisTabMaster = true;
  publish(keys.masterId, masterTabId);
  localStorage.removeItem(keys.electionInProgress);
  announceElectionResults(true);

  if (unloadListener) {
    window.removeEventListener("unload", unloadListener);
  }
  unloadListener = () => {
    const masterId = localStorage.getItem(keys.masterId);
    if (masterId && masterId === tabId) {
      // TODO: abdicate
    }
  };
  window.addEventListener("unload", unloadListener);
};

const initiateElection = () => {
  // master did not reply. Initiate election
  const electionTime = localStorage.getItem(keys.electionInProgress);
  masterTabId = "";
  if (electionTime) {
    // There is an election in progress. Wait for results
    log("Election already in progress");
    window.setTimeout(() => {
      if (masterTabId != null && masterTabId.length === 0) {
        declareThisTabAsMaster();
      } else if (masterTabId !== tabId) {
        announceElectionResults(false);
      }
      logMaster();
    }, electionDuration);
  } else {
    log("Election not in progress");
    localStorage.setItem(keys.electionInProgress, timestamp());
    if (masterTabId.length === 0) {
      declareThisTabAsMaster();
    } else if (masterTabId !== tabId) {
      announceElectionResults(false);
    }
    logMaster();
  }
};

const pingMasterAndInitiateElectionIfNotActive = () => {
  log("Checking if Master still active");
  if (isThisTabMaster || Date.now() - masterLastResponseTime <= masterIdleTimeBuffer) {
    return;
  }
  masterNodeReply = "";
  publish(keys.masterIdRequest, masterIdRequestValue);
  window.setTimeout(() => {
    if (masterNodeReply.length === 0) {
      if (isThisTabMaster || Date.now() - masterLastResponseTime <= masterIdleTimeBuffer) {
        declareThisTabAsMaster();
        return;
      }
      log("Master did not respond. Initiating election");
      initiateElection();
    } else if (masterTabId !== masterNodeReply) {
      announceElectionResults(false); // initiated as a slave
      masterTabId = masterNodeReply;
      logMaster();
    }
  }, waitIntervalForMasterHeartBeat);
};

const monitorMasterNode = () => {
  if (masterNodeMonitorTimer) {
    clearTimeout(masterNodeMonitorTimer);
  }
  masterNodeMonitorTimer = window.setTimeout(() => {
    if (!isThisTabMaster) {
      pingMasterAndInitiateElectionIfNotActive();
    } else {
      localStorage.setItem(keys.masterLastResponseTime, timestamp());
    }
    monitorMasterNode();
  }, monitorMasterNodeInterval);
};

const subscribeToEvents = () => {
  log("Binding to events");

  subscribe(keys.masterIdRequest, namespaceForEvents, message => {
    if (isThisTabMaster && message === masterIdRequestValue) {
      log("Query Received - Confirming Still Master");
      publish(keys.masterIdResponse, tabId);
      localStorage.setItem(keys.masterLastResponseTime, timestamp());
    }
  });

  subscribe(keys.masterId, namespaceForEvents, message => {
    if (message) {
      log("Received Notice Of Master");
      masterLastResponseTime = Date.now();
      masterTabId = message;
      const wasCurrentlyMaster = isThisTabMaster;
      isThisTabMaster = masterTabId === tabId;
      if (!isThisTabMaster && wasCurrentlyMaster) {
        announceElectionResults(false);
        monitorMasterNode(); // master just responded. Move the monitoring to later
      }
      if (isThisTabMaster && !wasCurrentlyMaster) {
        declareThisTabAsMaster();
      }
      localStorage.removeItem(keys.electionInProgress);
      logMaster();
    }
  });

  subscribe(keys.masterIdResponse, namespaceForEvents, message => {
    if (message) {
      log("Master Responded to Query");
      masterLastResponseTime = Date.now();
      masterNodeReply = message;
      monitorMasterNode(); // master just responded. Move the monitoring to later
    } else {
      log("Master Responded to Query - no message");
    }
  });
};

const purgeElectionDetails = () => {
  const electionTime = localStorage.getItem(keys.electionInProgress);
  const lastElectionTimeInMs = parseInt(electionTime ?? "", 10);
  if (electionTime && Date.now() - lastElectionTimeInMs > electionDetailsPurgeInterval) {
    localStorage.removeItem(keys.electionInProgress);
  }
  window.setTimeout(purgeElectionDetails, electionDetailsPurgeInterval);
};

const nominateAsEligible = () => {
  // Role assignment
  const masterId = localStorage.getItem(keys.masterId);
  subscribeToEvents();
  const masterLastResponseTimeString = localStorage.getItem(keys.masterLastResponseTime);
  if (!masterLastResponseTimeString || masterLastResponseTimeString.length === 0) {
    masterLastResponseTime = 0;
  } else {
    masterLastResponseTime = parseInt(masterLastResponseTimeString, 10);
  }
  if (masterId) {
    if (masterId === tabId) {
      isThisTabMaster = true;
    } else if (
      masterLastResponseTime > 0 &&
      Date.now() - masterLastResponseTime > masterLastResponseTimeThreshold
    ) {
      // The master node has not responded to pings in a long time. Time to declare this tab as the master!
      initiateElection();
    } else {
      pingMasterAndInitiateElectionIfNotActive();
    }
  } else {
    initiateElection();
  }
  window.setTimeout(() => {
    purgeElectionDetails();
  }, electionDetailsPurgeInterval);
  monitorMasterNode();
};

const start = () => {
  if (isAvailable()) {
    nominateAsEligible();
  }
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}

export { isAvailable };

export const isMasterTab = () => isThisTabMaster;

export const subscribeToMasterChange = (callback: (isMaster: boolean) => void) => {
  electionListeners.push(callback);
};

export const attachLogger = (loggerCallback: (message: string) => void) => {
  loggers.push(loggerCallback);
};
