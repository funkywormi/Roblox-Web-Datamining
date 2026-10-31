import type { ComponentProps, ComponentType } from "react";
import type EmailVerifyCodeModalApp from "@rbx/authentication/emailVerifyCodeModal/EmailVerifyCodeModalApp";
import type PhoneUpsellApp from "@rbx/authentication/verificationUpsellModal/PhoneUpsellApp";

type ModalLoader<P> = () => Promise<{ default: ComponentType<P> }>;

export type ChallengeModalLoaders = {
  EmailVerifyCodeModal: ModalLoader<ComponentProps<typeof EmailVerifyCodeModalApp>>;
  PhoneUpsell: ModalLoader<ComponentProps<typeof PhoneUpsellApp>>;
};

// Next registers loaders and each challenge mount makes its own lazy component, so a failed chunk
// load is retried by the next challenge. On .NET the modals come from window.Roblox services
// instead, which keeps them out of the .NET challenge bundle.
let challengeModalLoaders: Partial<ChallengeModalLoaders> = {};

export const setChallengeModalLoaders = (loaders: ChallengeModalLoaders): void => {
  challengeModalLoaders = loaders;
};

export const getChallengeModalLoaders = (): Partial<ChallengeModalLoaders> => challengeModalLoaders;
