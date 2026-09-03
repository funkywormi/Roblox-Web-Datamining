import * as http from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import tradesConstants from "../constants/tradesConstants";

// TypeScript port of js/angular/trades/services/verificationService.js. Handles
// the 2SV trade-friction challenge lifecycle.

type TwoStepConfiguration = {
  methods: { enabled: boolean }[];
};

export const is2SVEnabled = async (): Promise<boolean> => {
  const url = tradesConstants.urls.get2SVConfiguration.replace(
    "{userId}",
    String(authenticatedUser()?.id),
  );
  const { data } = await http.get<TwoStepConfiguration>({ url, withCredentials: true });
  return data.methods.some(method => method.enabled);
};

export const redirectToSettings = (): void => {
  window.location.href = tradesConstants.urls.settings;
};

export const generateChallenge = async (): Promise<string> => {
  const { data } = await http.post<string>(
    { url: tradesConstants.urls.generate, withCredentials: true },
    {},
  );
  return data;
};

export const redeemVerificationChallenge = async (
  challengeToken: string,
  verificationToken: string,
): Promise<boolean> => {
  const { data } = await http.post<boolean>(
    { url: tradesConstants.urls.redeem, withCredentials: true },
    { challengeToken, verificationToken },
  );
  return data;
};
