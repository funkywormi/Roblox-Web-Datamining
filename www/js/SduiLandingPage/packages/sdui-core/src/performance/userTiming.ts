function hasPerformanceApi(): boolean {
  return typeof performance !== "undefined" && typeof performance.now === "function";
}

export function perfMark(name: string): void {
  if (!hasPerformanceApi() || typeof performance.mark !== "function") return;
  try {
    performance.mark(name);
  } catch {
    // Marks are best-effort diagnostics.
  }
}

export function perfMeasure(label: string, startMark: string, endMark?: string): number | null {
  if (!hasPerformanceApi() || typeof performance.measure !== "function") return null;
  try {
    const measure = performance.measure(label, startMark, endMark);
    return measure.duration;
  } catch {
    return null;
  }
}

export function perfNow(): number {
  if (!hasPerformanceApi()) return 0;
  return performance.now();
}
