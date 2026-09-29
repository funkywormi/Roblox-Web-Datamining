import type { Attributes } from "../types";

import { sendRaw, sendCompressed } from "./transport";

// Proto wire types
const WIRE_VARINT = 0;
const WIRE_64BIT = 1;
const WIRE_LEN = 2;

// Field tags: (field_number << 3) | wire_type
const tag = (field: number, wire: number): number => (field << 3) | wire;

// Typed-field constant tags for all messages we encode

// EngineTelemetryAttributes map entry fields
const AT_INT32 = tag(1, WIRE_LEN); // map<string, int32>
const AT_INT64 = tag(2, WIRE_LEN); // map<string, int64>
const AT_STRING = tag(5, WIRE_LEN); // map<string, string>
const AT_BOOL = tag(6, WIRE_LEN); // map<string, bool>
const AT_DOUBLE = tag(8, WIRE_LEN); // map<string, double>

// EngineTelemetryCounterMetricEvent
const COUNTER_NAME = tag(1, WIRE_LEN); // string name
const COUNTER_VALUE = tag(2, WIRE_64BIT); // double value
const COUNTER_TIMESTAMP = tag(3, WIRE_VARINT); // int64 eventTimestampMillisecond
const COUNTER_ATTRS = tag(5, WIRE_LEN); // message attributes

// EngineTelemetryHistogramMetricEvent
const HIST_NAME = tag(1, WIRE_LEN); // string name
const HIST_SUM = tag(2, WIRE_64BIT); // double sum
const HIST_COUNT = tag(3, WIRE_VARINT); // uint64 count
const HIST_COUNTS_IN_BUCKETS = tag(4, WIRE_LEN); // repeated uint64 countsInBuckets (packed)
const HIST_BUCKET_INDICES = tag(5, WIRE_LEN); // repeated int32 bucketIndices (packed)
const HIST_TIMESTAMP = tag(6, WIRE_VARINT); // int64 eventTimestampMillisecond
const HIST_ATTRS = tag(8, WIRE_LEN); // message attributes

// EngineTelemetryBatchEvent
const BATCH_TIMESTAMP = tag(4, WIRE_VARINT); // int64 batchTimestampMilliseconds
const BATCH_COUNTERS = tag(6, WIRE_LEN); // repeated EngineTelemetryCounterMetricEvent
const BATCH_STATS = tag(7, WIRE_LEN); // repeated EngineTelemetryHistogramMetricEvent
const BATCH_VERSION = tag(1, WIRE_VARINT); // int64 version
const BATCH_UUID = tag(2, WIRE_LEN); // string uuid

// SendEventRequest / Event (experience_signals_ingest)
const EVENT_SOURCE = tag(1, WIRE_LEN); // string source
const EVENT_PAYLOAD = tag(2, WIRE_LEN); // bytes payload
const SEND_EVENT_REQ_EVENT = tag(1, WIRE_LEN); // message event

// SendOptimizedBatchRequest.SubBatch
const SUBBATCH_SOURCE = tag(1, WIRE_LEN); // string source
const SUBBATCH_PAYLOADS = tag(2, WIRE_LEN); // repeated bytes payloads

// SendOptimizedBatchRequest
const OPTIMIZED_SUBBATCHES = tag(1, WIRE_LEN); // repeated SubBatch subBatches

// Proto type names (used as event source identifier by the ingest API)
const BATCH_EVENT_TYPE = "eventstream.enginetelemetry.EngineTelemetryBatchEvent";

// ---- Encoder helpers ----

const textEncoder = new TextEncoder();

class ProtoWriter {
  private readonly buf: number[] = [];

  writeVarint(value: bigint | number): void {
    let v = typeof value === "bigint" ? value : BigInt(Math.trunc(value));
    if (v < BigInt(0)) {
      // Two's complement: encode as 64-bit
      v = v + (BigInt(1) << BigInt(64));
    }
    while (v > BigInt(127)) {
      this.buf.push(Number(v & BigInt(0x7f)) | 0x80);
      v >>= BigInt(7);
    }
    this.buf.push(Number(v));
  }

  writeString(s: string): void {
    const encoded = textEncoder.encode(s);
    this.writeVarint(encoded.length);
    for (const b of encoded) {
      this.buf.push(b);
    }
  }

  writeBytes(bytes: Uint8Array): void {
    this.writeVarint(bytes.length);
    for (const b of bytes) {
      this.buf.push(b);
    }
  }

  writeDouble(value: number): void {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, true);
    for (let i = 0; i < 8; i += 1) {
      this.buf.push(view.getUint8(i));
    }
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buf);
  }
}

// ---- Attribute encoder ----

const INT32_MIN = -(2 ** 31);
const INT32_MAX = 2 ** 31 - 1;

function fitsInt32(value: number): boolean {
  return Number.isInteger(value) && value >= INT32_MIN && value <= INT32_MAX;
}

function encodeMapEntry(
  key: string,
  valueTag: number,
  writeValue: (w: ProtoWriter) => void,
): Uint8Array {
  const entry = new ProtoWriter();
  entry.writeVarint(tag(1, WIRE_LEN));
  entry.writeString(key);
  entry.writeVarint(valueTag);
  writeValue(entry);
  return entry.toBytes();
}

function encodeAttributes(attrs: Attributes): Uint8Array {
  const w = new ProtoWriter();
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === "string") {
      const entry = encodeMapEntry(key, tag(2, WIRE_LEN), e => {
        e.writeString(value);
      });
      w.writeVarint(AT_STRING);
      w.writeBytes(entry);
    } else if (typeof value === "boolean") {
      const entry = encodeMapEntry(key, tag(2, WIRE_VARINT), e => {
        e.writeVarint(value ? 1 : 0);
      });
      w.writeVarint(AT_BOOL);
      w.writeBytes(entry);
    } else if (typeof value === "bigint") {
      const entry = encodeMapEntry(key, tag(2, WIRE_VARINT), e => {
        e.writeVarint(value);
      });
      w.writeVarint(AT_INT64);
      w.writeBytes(entry);
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        const entry = encodeMapEntry(key, tag(2, WIRE_LEN), e => {
          e.writeString(String(value));
        });
        w.writeVarint(AT_STRING);
        w.writeBytes(entry);
      } else if (fitsInt32(value)) {
        const entry = encodeMapEntry(key, tag(2, WIRE_VARINT), e => {
          e.writeVarint(value);
        });
        w.writeVarint(AT_INT32);
        w.writeBytes(entry);
      } else if (Number.isInteger(value)) {
        const entry = encodeMapEntry(key, tag(2, WIRE_VARINT), e => {
          e.writeVarint(BigInt(value));
        });
        w.writeVarint(AT_INT64);
        w.writeBytes(entry);
      } else {
        const entry = encodeMapEntry(key, tag(2, WIRE_64BIT), e => {
          e.writeDouble(value);
        });
        w.writeVarint(AT_DOUBLE);
        w.writeBytes(entry);
      }
    }
  }
  return w.toBytes();
}

// ---- Counter event encoder ----

export type CounterEventData = {
  name: string;
  value: number;
  timestampMs: bigint;
  attributes?: Attributes;
};

function encodeCounter(event: CounterEventData): Uint8Array {
  const w = new ProtoWriter();
  w.writeVarint(COUNTER_NAME);
  w.writeString(event.name);
  w.writeVarint(COUNTER_VALUE);
  w.writeDouble(event.value);
  w.writeVarint(COUNTER_TIMESTAMP);
  w.writeVarint(event.timestampMs);
  if (event.attributes && Object.keys(event.attributes).length > 0) {
    const attrBytes = encodeAttributes(event.attributes);
    w.writeVarint(COUNTER_ATTRS);
    w.writeBytes(attrBytes);
  }
  return w.toBytes();
}

// ---- Histogram event encoder ----

export type HistogramEventData = {
  name: string;
  sum: number;
  count: bigint;
  bucketIndices: number[];
  countsInBuckets: bigint[];
  timestampMs: bigint;
  attributes?: Attributes;
};

function encodeHistogram(event: HistogramEventData): Uint8Array {
  const w = new ProtoWriter();
  w.writeVarint(HIST_NAME);
  w.writeString(event.name);
  w.writeVarint(HIST_SUM);
  w.writeDouble(event.sum);
  w.writeVarint(HIST_COUNT);
  w.writeVarint(event.count);

  // Packed repeated uint64 countsInBuckets
  if (event.countsInBuckets.length > 0) {
    const packed = new ProtoWriter();
    for (const c of event.countsInBuckets) {
      packed.writeVarint(c);
    }
    const packedBytes = packed.toBytes();
    w.writeVarint(HIST_COUNTS_IN_BUCKETS);
    w.writeBytes(packedBytes);
  }

  // Packed repeated int32 bucketIndices
  if (event.bucketIndices.length > 0) {
    const packed = new ProtoWriter();
    for (const idx of event.bucketIndices) {
      packed.writeVarint(idx);
    }
    const packedBytes = packed.toBytes();
    w.writeVarint(HIST_BUCKET_INDICES);
    w.writeBytes(packedBytes);
  }

  w.writeVarint(HIST_TIMESTAMP);
  w.writeVarint(event.timestampMs);

  if (event.attributes && Object.keys(event.attributes).length > 0) {
    const attrBytes = encodeAttributes(event.attributes);
    w.writeVarint(HIST_ATTRS);
    w.writeBytes(attrBytes);
  }

  return w.toBytes();
}

// ---- Batch event encoder ----

function encodeBatchEvent(
  counters: Uint8Array[],
  stats: Uint8Array[],
  batchTimestampMs: bigint,
): Uint8Array {
  const w = new ProtoWriter();
  w.writeVarint(BATCH_TIMESTAMP);
  w.writeVarint(batchTimestampMs);
  for (const c of counters) {
    w.writeVarint(BATCH_COUNTERS);
    w.writeBytes(c);
  }
  for (const s of stats) {
    w.writeVarint(BATCH_STATS);
    w.writeBytes(s);
  }
  return w.toBytes();
}

function encodeBatchEventWithMeta(
  counters: Uint8Array[],
  stats: Uint8Array[],
  batchTimestampMs: bigint,
  version: bigint,
  uuid: string,
): Uint8Array {
  const w = new ProtoWriter();
  w.writeVarint(BATCH_VERSION);
  w.writeVarint(version);
  w.writeVarint(BATCH_UUID);
  w.writeString(uuid);
  w.writeVarint(BATCH_TIMESTAMP);
  w.writeVarint(batchTimestampMs);
  for (const c of counters) {
    w.writeVarint(BATCH_COUNTERS);
    w.writeBytes(c);
  }
  for (const s of stats) {
    w.writeVarint(BATCH_STATS);
    w.writeBytes(s);
  }
  return w.toBytes();
}

// ---- SendEventRequest encoder ----

function encodeSendEventRequest(batchPayload: Uint8Array): Uint8Array {
  const eventMsg = new ProtoWriter();
  eventMsg.writeVarint(EVENT_SOURCE);
  eventMsg.writeString(BATCH_EVENT_TYPE);
  eventMsg.writeVarint(EVENT_PAYLOAD);
  eventMsg.writeBytes(batchPayload);
  const eventBytes = eventMsg.toBytes();

  const req = new ProtoWriter();
  req.writeVarint(SEND_EVENT_REQ_EVENT);
  req.writeBytes(eventBytes);
  return req.toBytes();
}

// ---- SendOptimizedBatchRequest encoder ----

function encodeSendOptimizedBatchRequest(payloads: Uint8Array[]): Uint8Array {
  const subBatch = new ProtoWriter();
  subBatch.writeVarint(SUBBATCH_SOURCE);
  subBatch.writeString(BATCH_EVENT_TYPE);
  for (const p of payloads) {
    subBatch.writeVarint(SUBBATCH_PAYLOADS);
    subBatch.writeBytes(p);
  }
  const subBatchBytes = subBatch.toBytes();

  const req = new ProtoWriter();
  req.writeVarint(OPTIMIZED_SUBBATCHES);
  req.writeBytes(subBatchBytes);
  return req.toBytes();
}

// ---- Public API ----

export function sendCounterBatch(counters: CounterEventData[], batchTimestampMs: bigint): void {
  const encodedCounters = counters.map(encodeCounter);
  const batchPayload = encodeBatchEvent(encodedCounters, [], batchTimestampMs);
  const serialized = encodeSendEventRequest(batchPayload);
  sendCompressed("/v1/events/single", serialized);
}

export function sendCounterBatchSync(counters: CounterEventData[], batchTimestampMs: bigint): void {
  const encodedCounters = counters.map(encodeCounter);
  const batchPayload = encodeBatchEvent(encodedCounters, [], batchTimestampMs);
  const serialized = encodeSendEventRequest(batchPayload);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Uint8Array.buffer is always ArrayBuffer in browser contexts
  sendRaw("/v1/events/single", serialized.buffer as ArrayBuffer);
}

export function sendHistogramBatch(
  histograms: HistogramEventData[],
  batchTimestampMs: bigint,
  version: bigint,
  uuid: string,
): void {
  const encodedStats = histograms.map(encodeHistogram);
  const batchPayload = encodeBatchEventWithMeta([], encodedStats, batchTimestampMs, version, uuid);
  const serialized = encodeSendOptimizedBatchRequest([batchPayload]);
  sendCompressed("/v1/events/optimized", serialized);
}

export function sendHistogramBatchSync(
  histograms: HistogramEventData[],
  batchTimestampMs: bigint,
  version: bigint,
  uuid: string,
): void {
  const encodedStats = histograms.map(encodeHistogram);
  const batchPayload = encodeBatchEventWithMeta([], encodedStats, batchTimestampMs, version, uuid);
  const serialized = encodeSendOptimizedBatchRequest([batchPayload]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Uint8Array.buffer is always ArrayBuffer in browser contexts
  sendRaw("/v1/events/optimized", serialized.buffer as ArrayBuffer);
}
