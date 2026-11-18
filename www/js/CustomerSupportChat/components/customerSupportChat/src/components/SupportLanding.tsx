import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Link } from "@rbx/foundation-ui";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import SupportForm from "../SupportForm";
import SupportChatLanding from "./support-chat-landing/SupportChatLanding";
import SupportSignInGate from "./support-chat-landing/SupportSignInGate";
import { Chat } from "./c3-chat/Chat";
import {
  SupportUiChoice,
  getStoredSupportUiChoice,
  getSupportUiChoiceFromUrl,
  isSupportLandingPreviewUrl,
  isSupportRegularFormUrl,
  regularSupportFormSearch,
  storeSupportUiChoice,
} from "../core/helpers/supportUiPrototype";
import { isProd } from "../core/helpers/supportEnvironment";
import {
  declineSupportSignIn,
  hasDeclinedSupportSignIn,
} from "../core/helpers/supportSignInDecline";
import { supportLoginPath } from "../core/helpers/supportLoginPath";
import {
  fitSupportFormFallbackMessage,
  SupportFormPrefill,
} from "../core/helpers/supportFormPrefill";
import { C3ChatMetadataPayload } from "../core/types/c3Chat";
import {
  createNewSupportConversation,
  isCaptchaAbandoned,
} from "../core/services/newSupportConversationService";
import { getAndValidateQueryParam } from "../core/helpers/supportFormHelpers";
import { useFetchMetadata } from "../hooks/supportFormServices";
import useArticleSuggestions from "../hooks/useArticleSuggestions";
import { DEFAULT_LOCALE } from "../hooks/useGetUserLocale";
import EmployeeOnly from "./employee-only/EmployeeOnly";

const SWITCH_TO_CLASSIC = "Switch to classic support experience";
const SWITCH_TO_NEW = "Switch to new support experience";
const ARTICLE_ID = /^\d{1,20}$/;
/** A Help Center locale, such as `fr` or `fr-ca`. Anything else is ignored. */
const ARTICLE_LANG = /^[a-z]{2}(?:[-_][a-z0-9]{2,3})?$/i;

const SupportLanding: React.FC<WithTranslationsProps> = props => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  // Shares the provider's query, so this reads the cached metadata rather than fetching it again.
  const { data: metadata, isError: isMetadataError } = useFetchMetadata();
  const [toggledChoice, setToggledChoice] = useState<SupportUiChoice>();
  // Held in memory only. A refresh returns to the landing and starts a new conversation.
  const [chatConfig, setChatConfig] = useState<C3ChatMetadataPayload | null>(null);
  // What is in the landing's message box, so a follow-up typed during the create opens with the chat.
  const landingDraft = useRef("");
  const [chatInitialDraft, setChatInitialDraft] = useState("");
  // A conversation that can't be started falls back to the support form. It is held in state
  // rather than the URL so it can't be bookmarked to skip the new experience, and a refresh goes
  // back to the new experience.
  const [hasFallenBackToForm, setHasFallenBackToForm] = useState(false);
  const [hasDeclinedSignIn, setHasDeclinedSignIn] = useState(hasDeclinedSupportSignIn);
  const [supportFormPrefill, setSupportFormPrefill] = useState<SupportFormPrefill>();
  // Set once the visitor edits the prefilled article title, so a remounted landing leaves it out.
  const [articlePrefillDismissed, setArticlePrefillDismissed] = useState(false);
  // Only the latest landing create may change the page.
  const landingRequestId = useRef(0);

  // Only employees can pick their experience; everyone else gets what the backend decided.
  const isEmployee = metadata?.isRobloxEmployee === true;
  const urlChoice = isEmployee ? getSupportUiChoiceFromUrl(search) : undefined;

  const isSignedIn = authenticatedUser.isAuthenticated;
  // The preview itself is limited to sitetest. Signed-out visitors there get the gate first.
  // Declining sign-in stays on the form for this browser tab, including after a trip to chat.
  // The failure redirect's form URL is limited the same way, so it can't skip the backend's
  // choice of experience in production.
  const showRegularForm = !isProd && isSupportRegularFormUrl(search);
  const isLandingPreview =
    toggledChoice === undefined &&
    !isProd &&
    !showRegularForm &&
    isSupportLandingPreviewUrl(search);
  const showSignInGate = isLandingPreview && !isSignedIn && !hasDeclinedSignIn;
  const getShowNewExperience = (): boolean => {
    if (hasFallenBackToForm || hasDeclinedSignIn) {
      return false;
    }
    if (!isEmployee) {
      return metadata?.isNewSupportExperienceEnabled === true;
    }
    // Employees always pass the backend gate, so they start on the classic form and opt in: the
    // switch this visit, then the URL, then their stored choice.
    return (toggledChoice ?? urlChoice ?? getStoredSupportUiChoice()) === "prototype";
  };
  const showNewExperience = getShowNewExperience();
  const showLandingPreview = isLandingPreview && isSignedIn;
  const metadataReady = metadata !== undefined || isMetadataError;
  // The title is only used on the landing, so the Zendesk request waits until that is what's shown.
  const showLanding =
    metadataReady &&
    chatConfig === null &&
    !showSignInGate &&
    !showRegularForm &&
    ((showLandingPreview && !hasFallenBackToForm) || showNewExperience);

  // The Help Center's contact links open /support?articleId=...&articleLang=.... The landing
  // starts its message box with that article's title. The id is not sent with the conversation.
  const queryParams = new URLSearchParams(search);
  const rawArticleId = getAndValidateQueryParam(queryParams, "articleId");
  const articleId = rawArticleId && ARTICLE_ID.test(rawArticleId) ? rawArticleId : undefined;
  const rawArticleLang = getAndValidateQueryParam(queryParams, "articleLang");
  const articleLang =
    rawArticleLang && ARTICLE_LANG.test(rawArticleLang) ? rawArticleLang : DEFAULT_LOCALE;
  const { data: articles } = useArticleSuggestions(
    articleId && showLanding ? [articleId] : [],
    !showLanding || articleId === undefined,
    articleLang,
  );
  const articleTitle = articles[0]?.title;

  useEffect(() => {
    if (urlChoice) {
      storeSupportUiChoice(urlChoice);
    }
  }, [urlChoice]);
  useEffect(
    () => () => {
      // A create that settles after the page is left must not redirect wherever the visitor went.
      landingRequestId.current += 1;
    },
    [],
  );
  // Which experience to show depends on metadata, so wait for it rather than flash one experience
  // and swap to the other. A failed fetch falls through to the support form.
  if (metadata === undefined && !isMetadataError) {
    return (
      <span role="progressbar" aria-label="Loading content" className="spinner spinner-default" />
    );
  }

  const sendLandingMessage = async (firstMessage: string) => {
    landingRequestId.current += 1;
    const requestId = landingRequestId.current;
    try {
      const created = await createNewSupportConversation(firstMessage);
      if (requestId === landingRequestId.current) {
        setChatInitialDraft(landingDraft.current);
        setChatConfig(created);
      }
    } catch (error) {
      if (isCaptchaAbandoned(error)) {
        throw error;
      }
      if (requestId === landingRequestId.current) {
        const fallback = fitSupportFormFallbackMessage(firstMessage, landingDraft.current);
        setSupportFormPrefill({
          message: fallback.message,
          messageWasShortened: fallback.wasShortened,
          // Tickets from the new experience stay tagged, as they were from the prototype.
          fromSupportAsk: true,
        });
        setHasFallenBackToForm(true);
        history.replace({ pathname, search: regularSupportFormSearch(search) });
      }
    }
  };

  const switchTo = (choice: SupportUiChoice) => {
    // A create still pending from the landing must not replace the experience picked here.
    landingRequestId.current += 1;
    storeSupportUiChoice(choice);
    setToggledChoice(choice);
    setHasFallenBackToForm(false);
    setSupportFormPrefill(undefined);
  };

  if (showSignInGate) {
    // pathname keeps a locale prefix such as /fr, on both the login page and the return URL.
    const returnUrl = `${window.location.origin}${pathname}${search}`;
    return (
      <SupportSignInGate
        onSignIn={() => {
          window.location.assign(
            `${supportLoginPath(pathname)}?returnUrl=${encodeURIComponent(returnUrl)}`,
          );
        }}
        onContinueWithoutSigningIn={() => {
          declineSupportSignIn();
          setHasDeclinedSignIn(true);
        }}
      />
    );
  }

  if (chatConfig !== null) {
    return <Chat embedded c3ChatConfig={chatConfig} initialDraft={chatInitialDraft} />;
  }

  const renderExperience = () => {
    if (showRegularForm) {
      return <SupportForm {...props} prefill={supportFormPrefill} />;
    }
    if ((showLandingPreview && !hasFallenBackToForm) || showNewExperience) {
      return (
        <SupportChatLanding
          // Switching experience drops a first message that is still sending, so start over.
          key={toggledChoice}
          onSend={sendLandingMessage}
          articlePrefill={articlePrefillDismissed ? undefined : articleTitle}
          onPrefillDismiss={() => {
            setArticlePrefillDismissed(true);
          }}
          onDraftChange={draft => {
            landingDraft.current = draft;
          }}
        />
      );
    }
    return <SupportForm {...props} prefill={supportFormPrefill} />;
  };

  return (
    // Out of the flow, so the switch sits in the corner of #support without shifting either layout.
    <div className="relative">
      {isEmployee && !showRegularForm && (
        <div
          className="absolute top-0 right-0 rtl:right-auto rtl:left-0 z-10 ltr:margin-right-small rtl:margin-left-small"
          data-testid="support-ui-switch"
        >
          <EmployeeOnly className="bg-surface-100">
            <Link
              as="button"
              type="button"
              underline="always"
              className="text-caption-medium"
              onClick={() => {
                switchTo(showNewExperience ? "classic" : "prototype");
              }}
              data-testid="support-ui-toggle"
            >
              {showNewExperience ? SWITCH_TO_CLASSIC : SWITCH_TO_NEW}
            </Link>
          </EmployeeOnly>
        </div>
      )}
      {renderExperience()}
    </div>
  );
};

export default SupportLanding;
