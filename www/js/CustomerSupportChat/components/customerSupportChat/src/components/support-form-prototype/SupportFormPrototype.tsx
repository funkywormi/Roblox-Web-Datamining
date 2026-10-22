import React, { KeyboardEvent, useCallback, useContext, useRef, useState } from "react";
import Markdown from "markdown-to-jsx";
import { Button, Icon, IconButton, Link } from "@rbx/foundation-ui";
import useSupportAsk from "../../hooks/useSupportAsk";
import useStartAskChat from "../../hooks/useStartAskChat";
import { AskReplyKind } from "../../core/types/supportAsk";
import { SupportContext } from "../../providers/SupportContextProvider";
import { isAskChatCategoryOffered } from "../../core/helpers/supportAskChatHelpers";
import { SupportFormPrefill } from "../../core/helpers/supportFormPrefill";
import EmployeeOnly from "../employee-only/EmployeeOnly";
import "./SupportFormPrototype.scss";

const HEADING = "Welcome to Roblox Support, how can we help?";
const ASK_PLACEHOLDER = "Ask a question";
const SEND_LABEL = "Send";
const LOADING_TEXT = "Getting you the help you need";
const BACK_LABEL = "Back";
const CHAT_PROMPT = "Still need help?";
const START_CHAT = "Start a chat";
const USE_SUPPORT_FORM = "Use the support form";
const ARTICLES_HEADING = "Learn more";
const CLASSIFIED_AS_LABEL = "Classified as:";
const NO_CLASSIFIED_CATEGORY = "none";

/** Answers cite help-center articles, so keep the answer in place when a link is followed. */
const MARKDOWN_OPTIONS = {
  wrapper: React.Fragment,
  overrides: {
    a: {
      component: ({ children, ...anchorProps }: React.ComponentPropsWithoutRef<"a">) => (
        <a {...anchorProps} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    },
  },
};

/** Clicking one fills the question box rather than sending, so it can be edited first. */
const QUICK_QUESTIONS = [
  {
    id: "lost-account",
    text: "I lost my account",
    iconName: "icon-filled-key",
  },
  {
    id: "deactivate-account",
    text: "I need to deactivate my account",
    iconName: "icon-filled-person-circle-slash",
  },
  {
    id: "voice-chat",
    text: "How do I get access to voice chat?",
    iconName: "icon-filled-microphone",
  },
] as const;

type SupportFormPrototypeProps = {
  /** Swaps to the support form in place, so it is only reachable from an answer. */
  onUseSupportForm: (prefill: SupportFormPrefill) => void;
};

const SupportFormPrototype: React.FC<SupportFormPrototypeProps> = ({ onUseSupportForm }) => {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { metadata } = useContext(SupportContext);
  const { submittedQuestion, reply, payload, chatMetadata, isWaiting, error, ask, reset } =
    useSupportAsk();
  const { startChat, isStarting, error: chatError, reset: resetChat } = useStartAskChat();
  // Only a portal answer gets an action button, and only an article-backed answer lists its
  // sources. Everything else -- plain messages, unrecognized kinds, and replies produced
  // outside the ask graph -- is the prose on its own.
  const portal = payload?.kind === AskReplyKind.Portal ? payload.portal : null;
  const articles = payload?.kind === AskReplyKind.Answer ? payload.articles : [];
  const supportCategory = payload?.supportCategory ?? null;
  // The pair also has to be offered to this user; otherwise the chat would start under the
  // fallback category.
  const offersChat =
    isAskChatCategoryOffered(supportCategory, metadata) &&
    (metadata?.chatbotFlowCategories ?? []).includes(supportCategory.category);
  const hasAnsweredOnTopic =
    reply !== null && chatMetadata !== null && payload?.kind !== AskReplyKind.OffTopic;
  // A failed ask has no category, so it is always pointed at the support form.
  const showsHelpPrompt = error !== null || hasAnsweredOnTopic;

  const goBack = useCallback(() => {
    reset();
    resetChat();
    setQuestion("");
  }, [reset, resetChat]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        ask(question);
      }
    },
    [question, ask],
  );

  if (submittedQuestion !== null) {
    return (
      <div className="support-prototype-page">
        <div className="support-prototype-query-header flex items-start gap-small">
          <IconButton
            icon="icon-filled-chevron-large-left"
            onClick={goBack}
            ariaLabel={BACK_LABEL}
            size="Medium"
            variant="Utility"
            // Offsets the icon's own padding so the chevron lines up with the page edge while
            // keeping the full hover target.
            className="shrink-0 ltr:margin-left-[-12px] rtl:margin-right-[-12px] rtl:[transform:scaleX(-1)]"
            data-testid="support-prototype-back"
          />
          <h1
            className="text-heading-medium support-prototype-query-heading"
            title={submittedQuestion}
          >
            {submittedQuestion}
          </h1>
        </div>

        {isWaiting && (
          <div
            className="support-prototype-loading"
            role="status"
            aria-live="polite"
            data-testid="support-prototype-loading"
          >
            <span>{LOADING_TEXT}</span>
            <span className="support-prototype-loading-dots" aria-hidden="true">
              <span className="spinner spinner-default" />
            </span>
          </div>
        )}

        {error && (
          <p className="support-prototype-result text-error" data-testid="support-prototype-error">
            {error}
          </p>
        )}

        {reply && (
          <div className="support-prototype-answer" data-testid="support-prototype-response">
            <div className="support-prototype-answer-body support-prototype-answer-markdown">
              <Markdown options={MARKDOWN_OPTIONS}>{reply}</Markdown>
            </div>

            {articles.length > 0 && (
              <div className="support-prototype-answer-sources">
                <h2 className="support-prototype-articles-heading text-title-large content-emphasis">
                  {ARTICLES_HEADING}
                </h2>
                <ul
                  className="support-prototype-articles radius-medium stroke-standard stroke-muted clip"
                  data-testid="support-prototype-articles"
                >
                  {articles.map(article => (
                    <li key={article.url}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="support-prototype-article flex items-center gap-medium padding-medium content-emphasis hover:bg-shift-100 focus-visible:outline-focus"
                      >
                        <Icon name="icon-regular-page" size="Medium" className="shrink-0" />
                        <span className="fill text-title-medium">{article.title}</span>
                        <Icon
                          name="icon-regular-arrow-up-right-from-square"
                          size="Small"
                          className="shrink-0 content-default rtl:[transform:scaleX(-1)]"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {portal && (
              <Button
                as="a"
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="Emphasis"
                size="Medium"
                data-testid="support-prototype-portal-cta"
              >
                {portal.ctaLabel}
              </Button>
            )}
          </div>
        )}

        {showsHelpPrompt && (
          <p
            className="support-prototype-chat-prompt text-body-medium"
            data-testid="support-prototype-chat-prompt"
          >
            {CHAT_PROMPT}{" "}
            {offersChat && chatMetadata ? (
              <Link
                as="button"
                type="button"
                underline="always"
                disabled={isStarting}
                onClick={() => {
                  startChat(chatMetadata, submittedQuestion, supportCategory);
                }}
                data-testid="support-prototype-start-chat"
              >
                {START_CHAT}
              </Link>
            ) : (
              <Link
                as="button"
                type="button"
                underline="always"
                onClick={() => {
                  onUseSupportForm({
                    message: submittedQuestion,
                    category: supportCategory?.category,
                    subcategory: supportCategory?.subcategory,
                  });
                }}
                data-testid="support-prototype-classic-form"
              >
                {USE_SUPPORT_FORM}
              </Link>
            )}
          </p>
        )}

        {chatError && (
          <p
            className="support-prototype-result text-error"
            data-testid="support-prototype-chat-error"
          >
            {chatError}
          </p>
        )}

        {reply && metadata?.isRobloxEmployee === true && (
          <EmployeeOnly
            className="margin-top-large"
            data-testid="support-prototype-classified-category"
          >
            <span>
              {CLASSIFIED_AS_LABEL}{" "}
              <code>
                {supportCategory
                  ? `${supportCategory.category} / ${supportCategory.subcategory}`
                  : NO_CLASSIFIED_CATEGORY}
              </code>
            </span>
          </EmployeeOnly>
        )}
      </div>
    );
  }

  return (
    <div className="support-prototype-page">
      <h1 className="text-heading-large support-prototype-heading">{HEADING}</h1>

      <div className="support-prototype-quick-links">
        {QUICK_QUESTIONS.map(quickQuestion => (
          <button
            key={quickQuestion.id}
            type="button"
            className="support-prototype-quick-link"
            onClick={() => {
              setQuestion(quickQuestion.text);
              inputRef.current?.focus();
            }}
            data-testid={`support-prototype-quick-link-${quickQuestion.id}`}
          >
            <span className="support-prototype-quick-link-icon">
              <Icon name={quickQuestion.iconName} size="Small" />
            </span>
            <span className="support-prototype-quick-link-text">{quickQuestion.text}</span>
          </button>
        ))}
      </div>

      <div className="support-prototype-ask">
        <textarea
          ref={inputRef}
          className="support-prototype-ask-input"
          value={question}
          onChange={event => {
            setQuestion(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={ASK_PLACEHOLDER}
          rows={3}
          data-testid="support-prototype-ask-input"
        />
        <div className="support-prototype-ask-footer">
          <Button
            variant="Emphasis"
            size="Small"
            isDisabled={!question.trim().length}
            onClick={() => {
              ask(question);
            }}
            data-testid="support-prototype-send"
          >
            {SEND_LABEL}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportFormPrototype;
