import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
  type GraphQLResponse,
} from "relay-runtime";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";

const accountManagementGraphQLUrl = `${environmentUrls.apiGatewayUrl}/account-management-api/graphql`;

export const fetchFn: FetchFunction = async (request, variables) => {
  // Only stored documents are sent, by id: the gateway doesn't serve plain queries. The Upload
  // Stored Documents workflow registers every document and commits its id.
  // Mutations are POSTs so that writes are never cached or retried like reads.
  if (request.id && request.operationKind === "mutation") {
    const { data } = await http.post<GraphQLResponse>(
      {
        url: `${accountManagementGraphQLUrl}/${request.name}/${request.id}`,
        withCredentials: true,
      },
      { variables },
    );
    return data;
  }
  if (request.id) {
    const { data } = await http.get<GraphQLResponse>(
      {
        url: `${accountManagementGraphQLUrl}/${request.name}/${request.id}`,
        withCredentials: true,
      },
      { variables: JSON.stringify(variables) },
    );
    return data;
  }

  return Promise.reject(
    new Error(
      `${request.name} has no stored-document id; run \`pnpm relay:upload\` to register it`,
    ),
  );
};

/**
 * The settings surfaces' own Relay environment, so they work on any page without the host
 * providing one.
 */
export const relayEnvironment = new Environment({
  network: Network.create(fetchFn),
  store: new Store(new RecordSource()),
});
