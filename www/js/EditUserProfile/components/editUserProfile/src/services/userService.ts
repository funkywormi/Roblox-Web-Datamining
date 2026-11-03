import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";

const PROFILE_URL = `${environmentUrls.apiGatewayUrl}/profile-platform-api/v1/profiles/get`;

interface ProfileResponse {
  components?: {
    About?: { description?: string | null };
  };
}

export async function getDescriptionAsync(userId: number): Promise<string> {
  const urlConfig: UrlConfig = {
    url: PROFILE_URL,
    withCredentials: true,
  };

  const response = await http.post<ProfileResponse>(urlConfig, {
    profileType: "User",
    profileId: String(userId),
    components: [{ component: "About" }],
    includeComponentOrdering: false,
  });
  return response.data.components?.About?.description ?? "";
}
