import * as z from "zod/mini";
import * as json from "@rbx/core-lib/json";
import { HttpError } from "@rbx/core-lib/http";

export const hbaUnauthorizedErrorCode = 9002;
export const hbaUnauthorizedErrorSubcode = 2;
export const hbaUnauthorizedEventName = "rbx:hba-unauthorized";

const errorBodySchema = z.object({
  errors: z.array(z.object({ code: z.optional(z.number()), subcode: z.optional(z.number()) })),
});

export const isHbaUnauthorizedError = (error: unknown): boolean => {
  if (!(error instanceof HttpError) || error.response.status !== 401) {
    return false;
  }
  const { body } = error.response;
  if (body == null) {
    return false;
  }
  const first = json.deserialize(errorBodySchema, body).getOrNull()?.errors[0];
  return first?.code === hbaUnauthorizedErrorCode && first.subcode === hbaUnauthorizedErrorSubcode;
};
