import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { signupFormStrings } from "../../constants/signupConstants";
import useSignupAuditContent from "../../hooks/useSignupAuditContent";
import useSignUpContainerV2State, { SignUpV2Step } from "../state/signUpContainerV2State";
import { SignUpV2Treatment } from "../utils/signupV2ExperimentUtils";

export type SignUpV2AuditContentProps = {
  treatment: SignUpV2Treatment;
  translate: WithTranslationsProps["translate"];
};

// A separate component so that audit store updates re-render it instead of the controller.
const SignUpV2AuditContent = ({ treatment, translate }: SignUpV2AuditContentProps): null => {
  const step = useSignUpContainerV2State(state => state.step);
  // Only the foundationControl form and the add auth method page show a password field.
  const isPasswordFieldShown =
    treatment === SignUpV2Treatment.FoundationControl || step === SignUpV2Step.AddAuthMethod;

  useSignupAuditContent(signupFormStrings.Birthday, translate);
  useSignupAuditContent(signupFormStrings.Username, translate);
  useSignupAuditContent(isPasswordFieldShown ? signupFormStrings.Password : null, translate);
  useSignupAuditContent(signupFormStrings.Gender, translate);

  return null;
};

export default SignUpV2AuditContent;
