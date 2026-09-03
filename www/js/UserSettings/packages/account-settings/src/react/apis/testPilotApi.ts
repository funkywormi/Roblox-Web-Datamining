import { EnvironmentUrls } from "Roblox";
import baseApi from "./common/baseApi";
import { Program } from "../userSettings/constants/betaPrograms/betaProgramsConstants";
import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";

interface GetProgramsApiResponse {
  betaPrograms: Program[];
}

interface OptInData {
  userId: number;
  programId: string;
}

interface OptInApiResponse {
  optIn: OptInData;
}

const testPilotApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBetaPrograms: builder.query<Program[], void>({
      query: () => ({
        url: `${EnvironmentUrls.apiGatewayUrl}/test-pilot-api/v1/beta-programs`,
        withCredentials: true,
      }),
      transformResponse: (response: GetProgramsApiResponse) => response.betaPrograms,
      providesTags: ["BetaPrograms"],
    }),
    getOptInStatus: builder.query<OptInData, void>({
      query: () => ({
        url: `${EnvironmentUrls.apiGatewayUrl}/test-pilot-api/v1/opt-in`,
        withCredentials: true,
      }),
      transformResponse: (response: OptInApiResponse) => response.optIn,
      providesTags: ["OptInStatus"],
    }),
    optInToProgram: builder.mutation<unknown, string>({
      query: (programId: string): TBaseQueryArgs => ({
        url: `${EnvironmentUrls.apiGatewayUrl}/test-pilot-api/v1/opt-in`,
        postBody: { programId },
        method: HttpMethod.POST,
      }),
      invalidatesTags: ["OptInStatus"],
    }),
  }),
});

export const { useGetBetaProgramsQuery, useGetOptInStatusQuery, useOptInToProgramMutation } =
  testPilotApi;
export default testPilotApi;
