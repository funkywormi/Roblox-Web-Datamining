import { post as legacyPost } from "@rbx/core-scripts/http";
import { post as nextjsPost } from "./requestTransport.nextjs";

export type PostConfig = {
  url: string;
  withCredentials?: boolean;
};

// Consumers that limit tsconfig types to jest have no Node `process`; Next inlines this read.
declare const process: { env: { NEXT_PUBLIC_IS_NEXTJS?: string } };

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export const post = <T>(config: PostConfig, data: object): Promise<{ data: T }> =>
  isNextJs ? nextjsPost<T>(config, data) : legacyPost<T>(config, data);
