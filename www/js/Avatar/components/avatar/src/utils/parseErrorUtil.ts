import { HttpError } from "@rbx/core-lib/http";

function parseError(error: unknown): string {
  if (error instanceof Error) {
    // Axios errors carry a `.code` (e.g. "ECONNABORTED"); core-lib HttpError carries an HTTP
    // status on `.response.status`. Capture whichever is present so analytics logs keep fidelity
    // on both the .NET (Axios) and Next.js (core-lib) paths. Read `.code` structurally rather than
    // via the Axios type so this stays free of `@rbx/core-scripts/http` on the Next.js path.
    const { code } = error as { code?: string };
    if (code) {
      return JSON.stringify({ message: error.message, stack: error.stack, code });
    }
    if (error instanceof HttpError) {
      return JSON.stringify({
        message: error.message,
        stack: error.stack,
        status: error.response.status,
      });
    }
    return JSON.stringify({
      message: error.message,
      stack: error.stack,
    });
  }

  return JSON.stringify(error);
}

export default parseError;
