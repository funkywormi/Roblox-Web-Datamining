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
const ignoredReportOnlyHostPatterns = [/\.rbxcdn\.com$/];

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
          let host: string;
          try {
            ({ host } = new URL(body.blockedURL));
          } catch {
            return true;
          }

          return !ignoredReportOnlyHostPatterns.some(pattern => pattern.test(host));
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
