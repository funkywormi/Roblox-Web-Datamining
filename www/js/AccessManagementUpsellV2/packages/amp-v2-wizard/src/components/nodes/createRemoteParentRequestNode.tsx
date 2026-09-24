import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Button, ProgressCircle, TextInput } from "@rbx/foundation-ui";
import type { TranslateFunction } from "@rbx/core-scripts/react";

import {
  remoteParentRequestApi,
  type RemoteParentRequestApi,
} from "../../services/remoteParentRequestApi";
import type { NodeComponent, NodeProps } from "../../types";

const PARENT_CONSENT = "ParentConsent";
const PARENT_LINK = "ParentLink";
const SUCCESS = "Success";
const CANCEL = "Cancel";
const EMAIL_PATTERN = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

type RequestDetails = Record<string, unknown>;
type Step = "loading" | "email" | "sending" | "confirmation" | "error";

type LegallySensitiveContent = {
  wordsOfConsent?: {
    button?: string;
    description?: string;
    footer?: string;
    placeholderText?: string;
    textboxLabel?: string;
    title?: string;
  };
};

type LegallySensitiveActions = {
  getBase64EncodedAuditHeader: () => string;
};

export type UseLegallySensitiveContent = (
  consentName: string,
  surface: string,
) => [LegallySensitiveContent, LegallySensitiveActions];

export type RemoteParentRequestConfig = {
  translate: TranslateFunction;
  useLegallySensitiveContent: UseLegallySensitiveContent;
  api?: RemoteParentRequestApi;
};

function isRemoteParentRequestConfig(value: unknown): value is RemoteParentRequestConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "translate" in value &&
    typeof value.translate === "function" &&
    "useLegallySensitiveContent" in value &&
    typeof value.useLegallySensitiveContent === "function"
  );
}

const fallbackConfig: RemoteParentRequestConfig = {
  translate: (key, _parameters, fallback) => fallback ?? key,
  useLegallySensitiveContent: () => [{}, { getBase64EncodedAuditHeader: () => "" }],
};

function asRequestDetails(value: unknown): RequestDetails | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(value));
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return undefined;
  }
  const data: unknown = error.data;
  if (typeof data !== "object" || data === null || !("code" in data)) {
    return undefined;
  }
  return typeof data.code === "string" ? data.code : undefined;
}

function errorTranslationKey(code: string | undefined): string {
  switch (code) {
    case "ChildAtLinkLimit":
      return "Message.ExistAccountWithEmail";
    case "ParentAtLinkLimit":
      return "Message.EmailIneligible";
    case "SenderFlooded":
      return "Message.TooManyAttemptAskParent";
    case "ReceiverFlooded":
      return "Message.TooManyAttempts";
    case "ConsentAlreadyApplied":
      return "Description.AllSet";
    case "AlreadyLinked":
      return "Message.AlreadyLinked";
    case "InvalidEmailAddress":
      return "Message.InvalidEmail";
    case undefined:
    default:
      return "Message.SomethingWentWrong";
  }
}

export const RemoteParentRequestNode: NodeComponent = ({
  props,
  ctx,
  report,
}: NodeProps): JSX.Element => {
  const configValue = ctx.config.remoteParentRequest;
  const configured = isRemoteParentRequestConfig(configValue);
  const config = configured ? configValue : fallbackConfig;
  const { translate, useLegallySensitiveContent, api = remoteParentRequestApi } = config;
  const action = props.action === PARENT_CONSENT ? PARENT_CONSENT : PARENT_LINK;
  const requestType =
    typeof props.requestType === "string" && props.requestType.length > 0
      ? props.requestType
      : undefined;
  const requestDetails = asRequestDetails(props.requestDetails);
  const [step, setStep] = useState<Step>("loading");
  const [email, setEmail] = useState("");
  const [parentEmails, setParentEmails] = useState<string[]>([]);
  const [isChildSubjectToParentalControls, setIsChildSubjectToParentalControls] = useState<
    boolean | undefined
  >();
  const [requestCreatedWithoutEmail, setRequestCreatedWithoutEmail] = useState(false);
  const [errorKey, setErrorKey] = useState("Message.SomethingWentWrong");
  const startedRef = useRef(false);
  const reportedRef = useRef(false);

  const consentName =
    isChildSubjectToParentalControls === undefined
      ? "vpcRequestLinkDefault"
      : isChildSubjectToParentalControls
        ? "vpcRequestLinkSubjectToPC"
        : "vpcRequestLinkNotSubjectToPC";
  const [legallySensitiveData, legallySensitiveActions] = useLegallySensitiveContent(
    consentName,
    "vpc-upsell-web",
  );
  const legallySensitiveCopy = legallySensitiveData.wordsOfConsent ?? {};

  const reportOnce = useCallback(
    (outcome: string): void => {
      if (reportedRef.current) {
        return;
      }
      reportedRef.current = true;
      report(outcome);
    },
    [report],
  );

  const sendToLinkedParents = useCallback(async (): Promise<void> => {
    if (requestType === undefined) {
      reportOnce(CANCEL);
      return;
    }
    setStep("sending");
    try {
      const [emails] = await Promise.all([
        api.getLinkedParentEmails().catch(() => []),
        api.sendToAllParents(requestType, requestDetails),
      ]);
      setParentEmails(emails);
      setStep("confirmation");
    } catch (error) {
      if (errorCode(error) === "SenderFloodedRequestCreated") {
        setRequestCreatedWithoutEmail(true);
        setStep("confirmation");
        return;
      }
      setErrorKey(errorTranslationKey(errorCode(error)));
      setStep("error");
    }
  }, [api, reportOnce, requestDetails, requestType]);

  const prepareEmailEntry = useCallback(async (): Promise<void> => {
    try {
      setIsChildSubjectToParentalControls(await api.isChildSubjectToParentalControls());
    } catch {
      // The default legally-sensitive copy is valid when the feature check is unavailable.
    }
    setStep("email");
  }, [api]);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    if (!configured || requestType === undefined) {
      reportOnce(CANCEL);
      return;
    }
    if (action === PARENT_CONSENT) {
      sendToLinkedParents().catch(() => {
        setStep("error");
      });
    } else {
      prepareEmailEntry().catch(() => {
        setStep("error");
      });
    }
  }, [action, configured, prepareEmailEntry, reportOnce, requestType, sendToLinkedParents]);

  const submitEmail = async (): Promise<void> => {
    if (requestType === undefined || !EMAIL_PATTERN.test(email)) {
      return;
    }
    setStep("sending");
    try {
      await api.sendToNewParent(
        email,
        requestType,
        requestDetails,
        legallySensitiveActions.getBase64EncodedAuditHeader(),
      );
      setParentEmails([email]);
      setStep("confirmation");
    } catch (error) {
      if (errorCode(error) === "SenderFloodedRequestCreated") {
        setRequestCreatedWithoutEmail(true);
        setStep("confirmation");
        return;
      }
      setEmail("");
      setErrorKey(errorTranslationKey(errorCode(error)));
      setStep("error");
    }
  };

  const confirmationBody = useMemo(() => {
    if (requestCreatedWithoutEmail) {
      return translate("Message.RequestCreatedEmailNotSent");
    }
    if (parentEmails.length === 1) {
      return translate("Message.EmailSent", { parentEmail: parentEmails[0] });
    }
    return translate("Message.EmailSentPluralParent");
  }, [parentEmails, requestCreatedWithoutEmail, translate]);

  if (step === "loading" || step === "sending") {
    return (
      <div className="flex justify-center">
        <ProgressCircle
          ariaLabel={translate("Label.Loading")}
          variant="Indeterminate"
          size="Medium"
        />
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="gap-large flex flex-col" data-testid="remote-parent-request-confirmation">
        <h2 className="text-heading-small content-emphasis">{translate("Title.RequestSent")}</h2>
        {parentEmails.length === 1 && !requestCreatedWithoutEmail ? (
          <p
            className="text-body-medium content-default"
            // Feature.Parents intentionally formats the parent email as trusted translation markup.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: confirmationBody }}
          />
        ) : (
          <p className="text-body-medium content-default">{confirmationBody}</p>
        )}
        <Button
          variant="Emphasis"
          size="Medium"
          className="w-full"
          onClick={() => {
            reportOnce(SUCCESS);
          }}
        >
          {translate("Action.OK")}
        </Button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="gap-large flex flex-col" data-testid="remote-parent-request-error">
        <h2 className="text-heading-small content-emphasis">
          {translate("Message.SomethingWentWrong")}
        </h2>
        {errorKey === "Message.SomethingWentWrong" ? null : (
          <p className="text-body-medium content-default">{translate(errorKey)}</p>
        )}
        <div className="gap-small flex flex-col">
          <Button
            variant="Emphasis"
            size="Medium"
            className="w-full"
            onClick={() => {
              if (action === PARENT_CONSENT) {
                sendToLinkedParents().catch(() => {
                  setStep("error");
                });
              } else {
                setStep("email");
              }
            }}
          >
            {translate("Action.Retry")}
          </Button>
          <Button
            variant="Standard"
            size="Medium"
            className="w-full"
            onClick={() => {
              reportOnce(CANCEL);
            }}
          >
            {translate("Action.Cancel")}
          </Button>
        </div>
      </div>
    );
  }

  const emailError =
    email.length > 0 && !EMAIL_PATTERN.test(email) ? translate("Message.InvalidEmail") : undefined;

  return (
    <div className="gap-large flex flex-col" data-testid="remote-parent-request-email">
      <div className="gap-xsmall flex flex-col">
        <h2 className="text-heading-small content-emphasis">
          {legallySensitiveCopy.title ?? translate("Title.EnterParentEmailV2")}
        </h2>
        <p
          className="text-body-medium content-default"
          // The legally-sensitive-content service supplies reviewed markup (for policy links).
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: legallySensitiveCopy.description ?? "" }}
        />
      </div>
      <div className="gap-xxlarge flex flex-col">
        <TextInput
          type="email"
          size="Medium"
          inputMode="email"
          autoComplete="email"
          label={legallySensitiveCopy.textboxLabel ?? translate("Label.ParentEmail")}
          placeholder={legallySensitiveCopy.placeholderText ?? translate("Label.EmailCapitalized")}
          isRequired
          value={email}
          onChange={event => {
            setEmail(event.target.value);
          }}
          error={emailError}
          hasError={emailError !== undefined}
        />
        <Button
          variant="Emphasis"
          size="Medium"
          className="w-full"
          isDisabled={email.length === 0 || emailError !== undefined}
          onClick={() => {
            submitEmail().catch(() => {
              setStep("error");
            });
          }}
        >
          {legallySensitiveCopy.button ?? translate("Action.SendEmail")}
        </Button>
      </div>
      {legallySensitiveCopy.footer ? (
        <p
          className="text-body-small content-default"
          // The legally-sensitive-content service supplies reviewed markup (for policy links).
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: legallySensitiveCopy.footer }}
        />
      ) : null}
    </div>
  );
};

RemoteParentRequestNode.ownsLoadingState = true;

// The host's dialog draws the email screen's only dismiss action, reporting Cancel.
RemoteParentRequestNode.dismissesOnCancel = true;
