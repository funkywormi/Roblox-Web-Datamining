const MAX_FRAME_LENGTH_VARINT_BYTES = 5;
export const MAX_SDUI_STREAM_FRAME_SIZE_BYTES = 50 * 1024 * 1024;
// A varint uses base 128 because each byte provides 7 bits of the length
const VARINT_BASE = 128;
const PROCESSED_FRAMES = "processedFrames" as const;

export class SduiStreamFrameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SduiStreamFrameError";
  }
}

export interface SduiFrameProcessingError<T> extends Error {
  readonly processedFrames: readonly T[];
}

export function isSduiFrameProcessingError<T>(
  error: unknown,
): error is SduiFrameProcessingError<T> {
  return error instanceof Error && PROCESSED_FRAMES in error;
}

function markFrameProcessingError<T>(
  error: unknown,
  processedFrames: readonly T[],
): SduiFrameProcessingError<T> {
  const processingError =
    error instanceof Error ? error : new Error(String(error), { cause: error });
  return Object.assign(processingError, { [PROCESSED_FRAMES]: processedFrames.slice() });
}

export interface SduiFrameBuilder<T> {
  processChunk(chunk: Uint8Array): T[];
  finalize(): void;
}

interface FrameLengthResult {
  length: number;
  // number of bytes that contributed to the length
  lengthPrefixByteCount: number;
}

/**
 * Starts from the given offset and reads the frame length from the given bytes
 */
function readFrameLength(
  bytes: Uint8Array,
  frameLengthStartOffset: number,
): FrameLengthResult | undefined {
  let length = 0;
  let multiplier = 1;

  const frameLengthEndOffset = Math.min(
    // we do not have to loop through the entire array because the frame length is limited
    frameLengthStartOffset + MAX_FRAME_LENGTH_VARINT_BYTES,
    bytes.length,
  );
  for (let index = frameLengthStartOffset; index < frameLengthEndOffset; index += 1) {
    const byte = bytes[index];
    if (byte === undefined) {
      // shouldn't happen, but here to satisfy typescript
      break;
    }
    /**
     *  Each varint byte contains a continuation bit and 7 bits that contribute to the length:
     *  byte: 1 0101100
     *        ^ +----- 7-bit value kept by `byte & 0x7f`
     *        +------- continuation bit
     */
    length += (byte & 0x7f) * multiplier;

    // If the continuation bit is 0, we have finished reading the length
    if ((byte & 0x80) === 0) {
      return { length, lengthPrefixByteCount: index - frameLengthStartOffset + 1 };
    }

    multiplier *= VARINT_BASE;
  }

  // If the loop looped through MAX_FRAME_LENGTH_VARINT_BYTES bytes and still
  // couldn't find the end of the length, it means the length is too long
  if (bytes.length - frameLengthStartOffset >= MAX_FRAME_LENGTH_VARINT_BYTES) {
    throw new SduiStreamFrameError("Frame length varint exceeds maximum size");
  }

  return undefined;
}

function appendBytes(existing: Uint8Array, incoming: Uint8Array): Uint8Array {
  if (existing.length === 0) {
    // create a copy so we don't modify the array passed to processFrame
    return incoming.slice();
  }

  if (incoming.length === 0) {
    return existing;
  }

  const combined = new Uint8Array(existing.length + incoming.length);
  combined.set(existing);
  combined.set(incoming, existing.length);
  return combined;
}

/** Splits arbitrary network chunks into `[varint length][payload]` frames. */
export function createSduiFrameBuilder<T>(
  processFrame: (payload: Uint8Array) => T,
): SduiFrameBuilder<T> {
  let pendingBytes: Uint8Array = new Uint8Array();
  let processedFrameCount = 0;
  let fatalError: Error | undefined;

  function fail(error: unknown): never {
    fatalError = error instanceof Error ? error : new Error(String(error));
    throw fatalError;
  }

  return {
    processChunk(chunk) {
      if (fatalError !== undefined) {
        throw fatalError;
      }

      const frames: T[] = [];
      let offset = 0;
      pendingBytes = appendBytes(pendingBytes, chunk);

      try {
        while (offset < pendingBytes.length) {
          const frameLengthResult = readFrameLength(pendingBytes, offset);
          if (!frameLengthResult) {
            break;
          }
          if (frameLengthResult.length === 0) {
            throw new SduiStreamFrameError("Frame length of zero is not a valid frame");
          }
          if (frameLengthResult.length > MAX_SDUI_STREAM_FRAME_SIZE_BYTES) {
            throw new SduiStreamFrameError(
              `Frame length ${frameLengthResult.length} exceeds maximum supported size`,
            );
          }

          const frameStart = offset + frameLengthResult.lengthPrefixByteCount;
          const frameEnd = frameStart + frameLengthResult.length;
          if (frameEnd > pendingBytes.length) {
            break;
          }

          let processedFrame: T;
          try {
            processedFrame = processFrame(pendingBytes.slice(frameStart, frameEnd));
          } catch (error) {
            return fail(markFrameProcessingError(error, frames));
          }
          frames.push(processedFrame);
          processedFrameCount += 1;
          offset = frameEnd;
        }
      } catch (error) {
        return fail(error);
      }

      pendingBytes = pendingBytes.slice(offset);
      return frames;
    },

    finalize() {
      if (fatalError !== undefined) throw fatalError;
      if (pendingBytes.length > 0) {
        throw new SduiStreamFrameError(
          `Streaming response ended with ${pendingBytes.length} undecoded bytes remaining`,
        );
      }
      if (processedFrameCount === 0) {
        throw new SduiStreamFrameError("Streaming request completed without receiving data");
      }
    },
  };
}
