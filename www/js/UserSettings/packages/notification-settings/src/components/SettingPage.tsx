import { JSX, useMemo } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { useLegallySensitiveContent } from "../hooks/useLegallySensitiveContent";
import { BackLink } from "./BackLink";
import { ChannelToggle } from "./ChannelToggle";
import {
  findLegallySensitiveMapping,
  legallySensitiveConsentMap,
} from "../constants/legallySensitiveConstants";
import { ROUTES, buildCategoryPath, buildSettingPath } from "../utils/routingUtils";
import { resolveNotificationTypePresentation } from "../utils/presentationUtils";
import type { SettingPageFragment$key } from "./__generated__/SettingPageFragment.graphql";
import SettingPageFragmentNode from "./__generated__/SettingPageFragment.graphql";
import type { NotificationCategory, SettingParams } from "../types";
import translationConstants from "../constants/translationConstants";

type SettingPageProps = {
  categories: readonly NotificationCategory[];
};

export const SettingPage = ({ categories }: SettingPageProps): JSX.Element => {
  const { categoryKey, settingKey } = useParams<SettingParams>();
  const { translate } = useTranslation();

  const notificationCategory = categories.find(c => c.category.value === categoryKey);
  const notificationTypeRef = notificationCategory?.notificationTypes.find(
    nt => nt.notificationType.value === settingKey,
  );

  const notificationType = useFragment<SettingPageFragment$key>(
    SettingPageFragmentNode,
    notificationTypeRef ?? null,
  );

  const notificationTypeValue = notificationType?.notificationType.value ?? "";

  const legallySensitiveMapping = useMemo(
    () =>
      notificationType
        ? findLegallySensitiveMapping(notificationType.channels, notificationTypeValue)
        : undefined,
    [notificationType, notificationTypeValue],
  );

  const { content: legallySensitiveContent } = useLegallySensitiveContent(legallySensitiveMapping);

  if (!notificationCategory) {
    return <Redirect to={ROUTES.categories} />;
  }

  if (!notificationType) {
    return <Redirect to={buildCategoryPath(categoryKey)} />;
  }

  const { pageTitle: lscPageTitle, pageDescription: lscPageDescription } =
    legallySensitiveContent.wordsOfConsent;
  const description =
    legallySensitiveMapping && lscPageDescription
      ? lscPageDescription
      : translate(translationConstants.chooseNotificationTypesDescription);

  const settingPath = buildSettingPath(categoryKey, settingKey);
  const fallbackTitleKey =
    resolveNotificationTypePresentation(notificationTypeValue).titleTranslationKey;
  const title = legallySensitiveMapping && lscPageTitle ? lscPageTitle : undefined;

  return (
    <div className="setting-page">
      <BackLink
        currentPagePath={settingPath}
        titleTranslationKey={fallbackTitleKey}
        title={title}
      />
      {description ? <p className="text-body-medium">{description}</p> : null}
      <div className="channels">
        {notificationType.channels.map(ch => (
          <ChannelToggle
            key={ch.channel.value}
            channelRef={ch}
            consentMapping={
              ch.channel.isLegallySensitive
                ? legallySensitiveConsentMap[notificationTypeValue]?.[ch.channel.value]
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default SettingPage;
