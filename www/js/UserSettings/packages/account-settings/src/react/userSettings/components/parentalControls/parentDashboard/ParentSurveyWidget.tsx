import React, { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Banner, Button, IconButton } from "@rbx/foundation-ui";
import {
  SurveyModal,
  fetchModalSurvey,
  modalSurveyNamespaces,
  recordModalSurveyExposure,
} from "@rbx/modal-survey";
import { useTranslations } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { parentSurveyTranslationKeys } from "./parentSurveyTranslationKeys";

export const PARENT_DASHBOARD_SURVEY_EVENT_TYPE = "parentDashboardLoaded";

const namespaces = [...modalSurveyNamespaces, "Feature.Parents"] as const;

const ParentSurveyWidgetContent = (): React.JSX.Element | null => {
  const t = useTranslations("Feature.Parents");
  const [isHidden, setIsHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch once per mount, like the dashboard load it's tied to. A refetch could close an open survey.
  const { data: survey } = useQuery({
    queryKey: ["modalSurvey", PARENT_DASHBOARD_SURVEY_EVENT_TYPE],
    queryFn: () => fetchModalSurvey(PARENT_DASHBOARD_SURVEY_EVENT_TYPE),
    retry: false,
    staleTime: Infinity,
  });

  if (!survey || isHidden) {
    return null;
  }

  const handleDismiss = () => {
    setIsHidden(true);
    recordModalSurveyExposure(survey.surveyId).catch(() => undefined);
  };

  return (
    <React.Fragment>
      <Banner
        className="margin-bottom-large [&_div]:max-width-full"
        density="Compact"
        type="Upsell"
        variant="Emphasis"
        title={t(parentSurveyTranslationKeys.heading)}
        description={t(parentSurveyTranslationKeys.description)}
        actions={
          <Button
            size="Small"
            variant="Emphasis"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            {t(parentSurveyTranslationKeys.startSharing)}
          </Button>
        }
        trailing={
          <IconButton
            ariaLabel={t(parentSurveyTranslationKeys.close)}
            icon="icon-regular-x"
            size="XSmall"
            variant="Utility"
            onClick={handleDismiss}
          />
        }
      />
      <SurveyModal
        open={isModalOpen}
        survey={survey}
        onClose={() => {
          setIsModalOpen(false);
          setIsHidden(true);
        }}
      />
    </React.Fragment>
  );
};

const ParentSurveyWidget = (): React.JSX.Element => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProviderSCC namespaces={namespaces}>
        <ParentSurveyWidgetContent />
      </TranslationProviderSCC>
    </QueryClientProvider>
  );
};

export default ParentSurveyWidget;
