import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  GraphQLResponse,
} from "relay-runtime";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";
import { accountManagementGraphQLUrl } from "./constants/urlConstants";

const fetchFn: FetchFunction = async (request, variables) => {
  if (request.id) {
    const urlConfig: UrlConfig = {
      url: `${accountManagementGraphQLUrl}/${request.name}/${request.id}`,
      withCredentials: true,
    };

    const { data } = await http.get<GraphQLResponse>(urlConfig, {
      variables: JSON.stringify(variables),
    });

    return data;
  }

  const urlConfig: UrlConfig = {
    url: accountManagementGraphQLUrl,
    withCredentials: true,
  };

  const { data } = await http.post<GraphQLResponse>(urlConfig, {
    query: request.text,
    variables,
  });

  return data;
};

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
