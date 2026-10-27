import * as http from "@rbx/core-scripts/http";
import type { UniversalFeatureRestrictionsHttp } from "@rbx/universal-feature-restrictions";
import universalFeatureRestrictionsRequestsNextJs from "./universalFeatureRestrictionsRequests.nextjs";

const legacy: UniversalFeatureRestrictionsHttp = {
  httpGet: <T>(url: string): Promise<T> =>
    http.get<T>({ url, withCredentials: true }).then(response => response.data),
  httpPost: async (url: string, body: object): Promise<void> => {
    await http.post({ url, withCredentials: true }, body);
  },
};

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? universalFeatureRestrictionsRequestsNextJs : legacy;
