/* eslint-disable no-restricted-globals -- raw fetch for keepalive + binary protobuf */
import environmentUrls from "@rbx/environment-urls";

export const BASE_URL = `${environmentUrls.apiGatewayUrl.replace(/\/$/, "")}/experience-signals-ingest/public`;

const noop = (): void => undefined;

export async function compress(
  data: Uint8Array,
): Promise<{ body: ArrayBuffer; compressed: boolean }> {
  if (typeof CompressionStream === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Uint8Array.buffer is always ArrayBuffer in browser contexts
    return { body: data.buffer as ArrayBuffer, compressed: false };
  }
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Uint8Array is valid BufferSource
  writer.write(data as unknown as Uint8Array<ArrayBuffer>).catch(noop);
  writer.close().catch(noop);
  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read(); // eslint-disable-line no-await-in-loop -- sequential stream reads
  }
  const len = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return { body: out.buffer, compressed: true };
}

export function sendRaw(path: string, body: ArrayBuffer): void {
  fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-protobuf" },
    body,
    credentials: "include",
    keepalive: true,
  }).catch(noop);
}

export function sendCompressed(path: string, data: Uint8Array): void {
  compress(data)
    .then(({ body, compressed }) => {
      const headers: Record<string, string> = { "Content-Type": "application/x-protobuf" };
      if (compressed) {
        headers["Content-Encoding"] = "gzip";
      }
      return fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers,
        body,
        credentials: "include",
        keepalive: true,
      });
    })
    .catch(noop);
}
