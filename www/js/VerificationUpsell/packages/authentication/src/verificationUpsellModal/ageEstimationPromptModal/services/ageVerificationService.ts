import { post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

export type PersonaSession = { sessionIdentifier?: string };

const { apiGatewayUrl } = environmentUrls;

// URL configs for ID verification
const startPersonaIdVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/start-verification`,
});

async function startPersonaIdVerification() {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true, ageEstimation: true };
  try {
    const { data } = await post<PersonaSession>(urlConfig, params);
    return data;
  } catch (err) {
    throw new Error(`Error to start ID verification: ${String(err ?? "unknown")}`);
  }
}

export default startPersonaIdVerification;
