import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";

import { supportChatTranslationConfig } from "../../app.config";
import SDKLoader from "./SDKLoader";
import useSierraChatRouteRedirect from "../../hooks/useSierraChatRouteRedirect";
import { useSierra } from "../../hooks/useSierra";

const ChatWidget: React.FC<WithTranslationsProps> = ({ translate: t }) => {
  // Route/nav/page helpers, query param state preload, context refreshes from custom context provider hook
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const guardianApprovalId = (queryParams.get("guardianApprovalId") || "").trim();
  const [isParentScrollDisabled, setIsParentScrollDisabled] = useState(false);

  // Custom hook for Sierra SDK state management
  const { setIsSDKLoaded, isLoading, hasSDKLoadError } = useSierra(guardianApprovalId);

  // Do not init Sierra until the DOM and SDK script is fully loaded
  useEffect(() => {
    window.sierraConfig = { waitForInit: true };
  }, [guardianApprovalId]);

  // Redirect back to the support form if we are missing guardianApprovalId, support form data, local convo session history, or config after loading sdk and u13 details from BE
  useSierraChatRouteRedirect(guardianApprovalId, hasSDKLoadError);

  return (
    <div
      className={classNames("mx-0 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-64", {
        "overflow-hidden": isParentScrollDisabled,
      })}
    >
      <SDKLoader
        onLoad={() => {
          setIsSDKLoaded(true);
        }}
      />
      <h1 className="container-header ml-2">{t("Heading.PageTitle")}</h1>
      <div id="chatLaunch" className="rounded-lg w-full lg:w-[650px]">
        <div className="rounded-lg section-content m-0">
          <h3 className="ml-4">{t("Chat.Header.CTATitle")}</h3>
          <p className="pre-btn-body ml-4">{t("Chat.Description.CTADescription")}</p>
          {isLoading && (
            <div className="loading-container p-4">
              <span className="spinner spinner-default" />
            </div>
          )}
          <br className="mt-6" />
          <div
            id="chatParentWrapper"
            className={classNames(
              "section-content m-0 min-h-[50vh] chat-parent-container animate-fadeIn rounded-md",
              {
                "overflow-y-scroll": isParentScrollDisabled,
              },
            )}
            // Disable parent scrollbar when hovering over the chat window
            onMouseEnter={() => {
              setIsParentScrollDisabled(true);
            }}
            onMouseLeave={() => {
              setIsParentScrollDisabled(false);
            }}
          >
            <div
              id="chatWrapper"
              className={classNames("chat-container rounded-md", {
                "overflow-y-scroll": isParentScrollDisabled,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(ChatWidget, supportChatTranslationConfig);
