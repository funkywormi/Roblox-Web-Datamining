import * as z from "zod/mini";

const validateBeduiData = <T extends z.ZodMiniType>(
  schema: T,
  data: unknown,
): { success: boolean; data: z.infer<T> | undefined; error: z.core.$ZodError | undefined } => {
  const parsedData = schema.safeParse(data);
  if (!parsedData.success) {
    return { success: false, data: undefined, error: parsedData.error };
  }
  return { success: true, data: parsedData.data, error: undefined };
};

export default validateBeduiData;
