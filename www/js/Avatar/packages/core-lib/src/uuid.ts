// jsdom lacks crypto.randomUUID but has crypto.getRandomValues; both paths emit a v4 UUID.
const hasRandomUUID = typeof crypto.randomUUID === "function";

const uuidFromRandomBytes = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (byte, i) => {
    // Pin the version (4) and variant (10xx) bits.
    const value = i === 6 ? (byte & 0x0f) | 0x40 : i === 8 ? (byte & 0x3f) | 0x80 : byte;
    return value.toString(16).padStart(2, "0");
  });
  return (
    `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-` +
    `${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`
  );
};

/** Generates a random RFC 4122 version 4 UUID. Next-safe, zero runtime deps. */
export const generateRandomUuid = (): string =>
  hasRandomUUID ? crypto.randomUUID() : uuidFromRandomBytes();
