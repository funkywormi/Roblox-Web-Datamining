import ready from "../../util/ready";
import { getClient } from "../lib/client";

interface RealtimeClient {
  IsConnected: () => boolean;
  SetLogger: (log: (message: string, color?: string) => void) => void;
  SetVerboseLogging: (verbose: boolean) => void;
  Subscribe: (namespace: string, handler: (message: unknown) => void) => void;
  SubscribeToConnectionEvents: (
    onConnected: () => void,
    onReconnected: () => void,
    onDisconnected: () => void,
    namespace: string,
  ) => void;
}

// Untyped JS module — cast at the boundary.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const getRealtimeClient = getClient as unknown as () => RealtimeClient;

let domLoggerReady = false;
let domLogger: HTMLElement | null = null;
let messageQueue: string[] = [];
let realTimeClient: RealtimeClient;

const log = (message: string, color?: string) => {
  try {
    // eslint-disable-next-line no-console
    console.log(`REALTIME DEBUGGER: ${message}`);
    if (domLoggerReady && domLogger) {
      const messageColor = color ?? "black";
      const dt = new Date();
      const time = `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}: `;
      domLogger.insertAdjacentHTML(
        "beforeend",
        `<div style='color:${messageColor}; margin-bottom:2px; border-bottom:1px solid black; font-size: 11px;'>${time}${message}</div>`,
      );
      domLogger.scrollTop = domLogger.scrollHeight;
    } else {
      messageQueue.push(message);
    }
  } catch {
    /* empty */
  }
};

const toggleShowLog = () => {
  if (domLogger) {
    domLogger.style.display = domLogger.style.display === "none" ? "block" : "none";
  }
};

const showStatus = (isConnected: boolean) => {
  const color = isConnected ? "green" : "red";
  document
    .getElementById("realtimeDebuggerCheckStatusButton")
    ?.style.setProperty("background-color", color);
};

const checkStatus = () => {
  const isConnected = realTimeClient.IsConnected();
  log(`SignalrR Connected:${isConnected}`);
  showStatus(isConnected);
};

const init = () => {
  realTimeClient = getRealtimeClient();
  realTimeClient.SetLogger(log);
  realTimeClient.SetVerboseLogging(true);

  ready(() => {
    let html = "";
    html +=
      "<div id='realtimeDebuggerControlPanel' style=' position: fixed; z-index: 2147483647; background-color: #aaaaaa; right: 24px; top: 24px; opacity: 0.9; '>";
    html += "<button id='realtimeDebuggerCheckStatusButton'>?</button>";
    html += "<button id='realtimeDebuggerToggleLogButton'>+/-</button>";
    html += "</div>";
    html +=
      "<div id='realtimeDebuggerLog' style='display: none; position: fixed; z-index: 2147483647; background-color: #aaaaaa; right: 24px; top: 44px; opacity: 0.9; height: 70%; width: 70%; overflow-y: scroll;'/>";
    document.body.insertAdjacentHTML("afterbegin", html);
    domLogger = document.getElementById("realtimeDebuggerLog");
    domLoggerReady = true;
    for (const message of messageQueue) {
      log(message);
    }
    messageQueue = [];
    document
      .getElementById("realtimeDebuggerCheckStatusButton")
      ?.addEventListener("click", checkStatus);
    document
      .getElementById("realtimeDebuggerToggleLogButton")
      ?.addEventListener("click", toggleShowLog);
    realTimeClient.Subscribe("ChatNotifications", (message: unknown) => {
      log(JSON.stringify(message), "darkblue");
    });
    realTimeClient.SubscribeToConnectionEvents(
      () => {
        log("Connection Event: connected");
        showStatus(true);
      },
      () => {
        log("Connection Event: reconnected");
        showStatus(true);
      },
      () => {
        log("Connection Event: disconnected");
        showStatus(false);
      },
      "ChatNotifications",
    );
    checkStatus();
  });
};

const debuggerInit = init;
export default { debuggerInit };
