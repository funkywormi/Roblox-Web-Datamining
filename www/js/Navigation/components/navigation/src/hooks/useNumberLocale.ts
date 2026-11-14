import useMountedValue from "./useMountedValue";

// The server has no viewer locale, so a fixed one until mount keeps hydration matching.
export default function useNumberLocale(): string | undefined {
  return useMountedValue<string | undefined>(() => undefined, "en-US");
}
