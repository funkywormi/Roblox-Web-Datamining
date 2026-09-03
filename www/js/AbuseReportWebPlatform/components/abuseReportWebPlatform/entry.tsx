import * as z from "zod/mini";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { ArwpUrlParamProvider } from "./src/context/ArwpUrlParamProvider";
import ArwpContainer from "./src/ArwpContainer";
import { translations } from "./component.json";
import "./src/main.css";
import "./src/abuseReportWebPlatform.scss";
import { ArwpGenericError } from "./src/components/ArwpError";

ready(() => {
  z.config(z.locales.en());
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <ArwpUrlParamProvider>
        <ArwpContainer />
      </ArwpUrlParamProvider>
    </TranslationProvider>,
    document.getElementById("abuse-report-web-platform-web-app"),
    undefined,
    <TranslationProvider config={translations}>
      <ArwpGenericError />
    </TranslationProvider>,
  );
});
