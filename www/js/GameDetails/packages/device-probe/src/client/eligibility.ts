// Where the probe runs: Web Play is only offered in some countries. Built into the client, not set
// by the host, so every bundle's copy applies it.
import { window } from "@rbx/core-lib/browser";
import { callBehaviour } from "@rbx/core-scripts/guac";

type WasmBundle = { wasmClientAvailable?: unknown };

/**
 * GUAC's answer: `unknown` when the request failed, took longer than
 * {@link REGION_CHECK_TIMEOUT_MS}, or didn't say.
 */
export type RegionAnswer = "offered" | "notOffered" | "unknown";

/** How long the GUAC request may take. Past it, the answer is `unknown`. */
export const REGION_CHECK_TIMEOUT_MS = 5000;

/**
 * Session storage keys for answers other than `offered`, each holding when it was given (Unix
 * milliseconds). While one is younger than its max age, the tab doesn't ask GUAC again: a user
 * where Web Play isn't offered doesn't ask on every page, and neither does anyone while GUAC is
 * failing. They hold only that answer and its time.
 */
export const REGION_NOT_OFFERED_KEY = "RBX_WASM_WEB_PLAY_NOT_OFFERED";
export const REGION_UNKNOWN_KEY = "RBX_WASM_WEB_PLAY_REGION_UNKNOWN";
export const REGION_NOT_OFFERED_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const REGION_UNKNOWN_MAX_AGE_MS = 15 * 60 * 1000;

declare global {
  interface Window {
    // On the window, not in this module, so every bundle's copy of the client asks once per
    // document between them.
    rbxDeviceProbeRegionAnswer?: Promise<RegionAnswer>;
  }
}

// Session storage can be blocked, which throws on access.
const isKept = (key: string, maxAgeMs: number, now: number): boolean => {
  try {
    const keptAt = Number(window?.sessionStorage.getItem(key));
    const age = now - keptAt;
    return Number.isFinite(keptAt) && keptAt > 0 && age >= 0 && age < maxAgeMs;
  } catch {
    return false;
  }
};

const keep = (key: string, now: number): void => {
  try {
    window?.sessionStorage.setItem(key, String(now));
  } catch {
    // The next page asks again.
  }
};

const keptAnswer = (now: number): RegionAnswer | null => {
  if (isKept(REGION_NOT_OFFERED_KEY, REGION_NOT_OFFERED_MAX_AGE_MS, now)) {
    return "notOffered";
  }
  return isKept(REGION_UNKNOWN_KEY, REGION_UNKNOWN_MAX_AGE_MS, now) ? "unknown" : null;
};

const answerFrom = (bundle: WasmBundle | null): RegionAnswer => {
  switch (bundle?.wasmClientAvailable) {
    case true:
      return "offered";
    case false:
      return "notOffered";
    default:
      return "unknown";
  }
};

const askGuac = (): Promise<RegionAnswer> =>
  new Promise(resolve => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    const settle = (answer: RegionAnswer): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (answer !== "offered") {
        keep(answer === "notOffered" ? REGION_NOT_OFFERED_KEY : REGION_UNKNOWN_KEY, Date.now());
      }
      resolve(answer);
    };
    timer = setTimeout(() => {
      settle("unknown");
    }, REGION_CHECK_TIMEOUT_MS);
    callBehaviour<WasmBundle | null>("wasm").then(
      bundle => {
        settle(answerFrom(bundle));
      },
      () => {
        settle("unknown");
      },
    );
  });

/**
 * Whether Web Play is offered in the request's country: the GUAC `wasm` bundle (AMP
 * `guac/GuacWasm`), the list play.roblox.com and Creator Hub use. Asked once per document, only
 * when a probe is about to run, and not again in the tab's session while an answer other than
 * `offered` is kept (see {@link REGION_NOT_OFFERED_KEY}). Never rejects.
 */
export const webPlayRegionAnswer = (): Promise<RegionAnswer> => {
  const win = window;
  if (win == null) {
    return Promise.resolve("unknown");
  }
  const kept = keptAnswer(Date.now());
  if (kept != null) {
    return Promise.resolve(kept);
  }
  win.rbxDeviceProbeRegionAnswer ??= askGuac();
  return win.rbxDeviceProbeRegionAnswer;
};
