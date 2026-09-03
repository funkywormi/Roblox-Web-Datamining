import { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { Icon } from "@rbx/foundation-ui";
import { translateHtml, type TranslateHtmlTag } from "@rbx/translation-utils";
import { Section, SectionHeader } from "./sections/Section";
import { isOnDesktop } from "../utils/platform";

const FAQ_BASE_KEYS = [
  "Action.WhatAreRobux",
  "Action.WhereAreMyRobux",
  "Action.DoRobuxExpire",
  ...(isOnDesktop ? ["Action.HowToRedeemGiftCard"] : []),
];

export function FAQ() {
  const { translate } = useTranslation();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggleItem = useCallback((id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const isMissingTranslation = (key: string, translation: string) => {
    const normalized = translation.trim();
    return !normalized || normalized === key;
  };

  return (
    <Section>
      <SectionHeader>{translate("Heading.FAQ")}</SectionHeader>
      <div className="self-stretch flex flex-col items-stretch gap-medium large:gap-large">
        {FAQ_BASE_KEYS.map(baseKey => {
          const questionKey = `${baseKey}Question`;
          const answerKey = `${baseKey}Answer`;
          const question = translate(questionKey);
          const answerPlain = translate(answerKey);

          if (
            isMissingTranslation(questionKey, question) ||
            isMissingTranslation(answerKey, answerPlain)
          ) {
            return null;
          }

          let answerTags: TranslateHtmlTag[] | undefined;
          if (baseKey === "Action.WhereAreMyRobux") {
            answerTags = [
              {
                opening: "transactionsLinkStart",
                closing: "transactionsLinkEnd",
                render: text => (
                  <a href={getAbsoluteUrl("/transactions")} className="text-link">
                    {text}
                  </a>
                ),
              },
            ];
          } else if (baseKey === "Action.HowToRedeemGiftCard") {
            answerTags = [
              {
                opening: "redeemLinkStart",
                closing: "redeemLinkEnd",
                render: text => (
                  <a href={getAbsoluteUrl("/redeem")} className="text-link">
                    {text}
                  </a>
                ),
              },
            ];
          }

          const isOpen = openIds.has(baseKey);
          const contentRegionId = `faq-panel-${baseKey}`;
          return (
            <div
              key={baseKey}
              className="radius-medium stroke-standard stroke-default overflow-hidden padding-x-medium padding-y-small"
            >
              <div
                role="button"
                aria-expanded={isOpen}
                aria-controls={contentRegionId}
                tabIndex={0}
                className="width-full cursor-pointer flex flex-row items-center justify-between height-1000 content-default"
                onClick={() => {
                  toggleItem(baseKey);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleItem(baseKey);
                  }
                }}
              >
                <span className="text-align-x-left text-title-medium">{question}</span>
                <Icon
                  name={
                    isOpen ? "icon-regular-chevron-large-up" : "icon-regular-chevron-large-down"
                  }
                  size="Medium"
                  className="content-emphasis"
                />
              </div>
              {isOpen && (
                <div
                  id={contentRegionId}
                  role="region"
                  aria-label={question}
                  className="padding-bottom-medium text-body-medium content-default"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {translateHtml(translate, answerKey, answerTags)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
