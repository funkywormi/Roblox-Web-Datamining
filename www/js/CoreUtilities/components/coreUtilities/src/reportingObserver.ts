import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

// We need to declare a bunch of types manually since we're on older ES versions
// and be careful not to break anything on older browsers

// https://developer.mozilla.org/en-US/docs/Web/API/COEPViolationReport#body
interface COEPReportBody {
  type: "corp" | "navigation" | "worker initialization";
  blockedURL: string;
  destination: string;
  disposition: "enforce" | "reporting";
}

// https://developer.mozilla.org/en-US/docs/Web/API/COEPViolationReport
interface Report {
  type: string;
  url: string;
  body: Record<string, unknown> | null;
}

type ReportingObserverCallback = (reports: Report[], observer: ReportingObserver) => void;

interface ReportingObserverOptions {
  types?: string[];
  buffered?: boolean;
}

// https://developer.mozilla.org/en-US/docs/Web/API/ReportingObserver
declare class ReportingObserver {
  constructor(callback: ReportingObserverCallback, options?: ReportingObserverOptions);
  observe(): void;
  disconnect(): void;
  takeRecords(): Report[];
}

let initialized = false;

// patterns to ignore when in report only mode
// these can have false alarms where we aren't sending credentials
const ignoredReportOnlyUrlMatchFuncs: ((url: URL) => boolean)[] = [
  // CDNs don't need credentials
  ({ hostname }) => hostname.endsWith(".rbxcdn.com"),
  ({ hostname }) => hostname === "cdn.foundation.roblox.com",
  // LMS: https://roblox.atlassian.net/wiki/spaces/NET/pages/4996235269/Latency+Measurement+System+LMS
  // e.g. https://atl4-128-116-2-3.roblox.com/_/_/1px.gif?t=...
  ({ hostname, pathname }) => hostname.endsWith(".roblox.com") && pathname === "/_/_/1px.gif",
  // CSP report happens without credentials
  ({ hostname, pathname }) => hostname.startsWith("metrics") && pathname.startsWith("/v1/csp"),
  // browser extension to ignore
  ({ hostname }) => hostname.endsWith("studyquicks.com"),
];
const fireTelemetry = createFireTelemetryCounter("Web_ReportingObserver");
export function initReportingObserver() {
  if (initialized) {
    return;
  }

  initialized = true;

  if (typeof window === "undefined" || !("ReportingObserver" in window)) {
    return;
  }

  const observer = new ReportingObserver(
    (reports, _observer) => {
      const coepBodies = reports
        .filter(r => r.type === "coep" && r.body !== null)
        .map(r => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            return JSON.parse(JSON.stringify(r.body)) as COEPReportBody;
          } catch {
            return null;
          }
        })
        .filter((body): body is COEPReportBody => {
          if (!body) {
            return false;
          }

          if (body.disposition === "enforce") {
            return true;
          }

          let url: URL;
          try {
            url = new URL(body.blockedURL);
          } catch {
            return true;
          }

          return !ignoredReportOnlyUrlMatchFuncs.some(matchFunc => matchFunc(url));
        });

      coepBodies.forEach(coepBody => {
        const { blockedURL, disposition, destination, type } = coepBody;
        // blockedURL too high cardinality to report to Grafana
        fireTelemetry("coepViolation", { disposition, destination, type });

        sendEventWithTarget("coepViolation", "reportingObserver", {
          blockedURL,
          disposition,
          destination,
          type,
        });
      });
    },
    { types: ["coep"], buffered: true },
  );

  observer.observe();
}
