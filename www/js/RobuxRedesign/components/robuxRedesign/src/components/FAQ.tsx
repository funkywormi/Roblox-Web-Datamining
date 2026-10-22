import { useCallback, useEffect, useState } from "react";
import { HtmlTag, useTranslations } from "@rbx/www-common/i18n";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { Icon } from "@rbx/foundation-ui";
import { Section, SectionHeader } from "./sections/Section";
import { isOnDesktop } from "../utils/platform";

const FAQ_BASE_KEYS = ["Action.WhatAreRobux", "Action.WhereAreMyRobux", "Action.DoRobuxExpire"];
const DESKTOP_FAQ_BASE_KEY = "Action.HowToRedeemGiftCard";

export function FAQ() {
  const translate = useTranslations("Feature.BuyRobux");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [showDesktopFaq, setShowDesktopFaq] = useState(false);

  useEffect(() => {
    setShowDesktopFaq(isOnDesktop);
  }, []);

  const faqKeys = showDesktopFaq ? [...FAQ_BASE_KEYS, DESKTOP_FAQ_BASE_KEY] : FAQ_BASE_KEYS;

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

  return (
    <Section>
      <SectionHeader>{translate("Heading.FAQ")}</SectionHeader>
      <div className="self-stretch flex flex-col items-stretch gap-medium large:gap-large">
        {faqKeys.map(baseKey => {
          const questionKey = `${baseKey}Question`;
          const answerKey = `${baseKey}Answer`;
          const hasQuestionKey = translate.has(questionKey);
          const hasAnswerKey = translate.has(answerKey);

          if (!hasQuestionKey || !hasAnswerKey) {
            return null;
          }

          let answerTags: HtmlTag[] = [];
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
          } else if (baseKey === DESKTOP_FAQ_BASE_KEY) {
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
                <span className="text-align-x-left text-title-medium">
                  {translate(questionKey)}
                </span>
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
                  aria-label={translate(questionKey)}
                  className="padding-bottom-medium text-body-medium content-default"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {translate.html(answerKey, answerTags)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
