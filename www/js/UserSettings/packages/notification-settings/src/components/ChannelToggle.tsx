import { JSX, useCallback, useRef, useState } from "react";
import { useFragment, useRelayEnvironment } from "react-relay";
import { commitLocalUpdate } from "relay-runtime";
import { Toggle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { RequirementType, SettingControlItem } from "@rbx/user-settings";
import { useLegallySensitiveContent } from "../hooks/useLegallySensitiveContent";
import { useUpdateUserSetting } from "../hooks/useUpdateUserSetting";
import { useRefetchNotificationSettings } from "../hooks/useRefetchNotificationSettings";
import translationConstants from "../constants/translationConstants";
import {
  resolveChannelDescriptionKey,
  resolveChannelLabelKey,
  resolveChannelLowercaseLabelKey,
} from "../utils/presentationUtils";
import { resolveBooleanOptionValues } from "../utils/settingValueUtils";
import type { LegallySensitiveMapping } from "../constants/legallySensitiveConstants";
import type { ChannelToggleFragment$key } from "./__generated__/ChannelToggleFragment.graphql";
import ChannelToggleFragmentNode from "./__generated__/ChannelToggleFragment.graphql";
import { CHANNEL_RELAY_FIELDS } from "../types";

type ChannelToggleProps = {
  channelRef: ChannelToggleFragment$key;
  consentMapping?: LegallySensitiveMapping;
  isDeviceChannel?: boolean;
};

export const ChannelToggle = ({
  channelRef,
  consentMapping,
  isDeviceChannel = false,
}: ChannelToggleProps): JSX.Element => {
  const { translate } = useTranslation();
  const environment = useRelayEnvironment();
  const refetchNotificationSettings = useRefetchNotificationSettings();

  const notificationChannel = useFragment<ChannelToggleFragment$key>(
    ChannelToggleFragmentNode,
    channelRef,
  );

  const { selectedOption, availableOptions } = notificationChannel.preference;

  // Device channels take a scalar update payload (i.e "Enabled" / "Disabled")
  // instead of a list of channel settings.
  const usesScalarPayload = isDeviceChannel;

  const [isEnabled, setIsEnabled] = useState(selectedOption?.enabled ?? false);

  const previousEnabledRef = useRef(isEnabled);

  const { enabledValue, disabledValue } = resolveBooleanOptionValues(
    selectedOption,
    availableOptions.map(opt => opt.option.value),
  );

  /** Sync the Relay store so enabled channel descriptions properly update */
  const updateRelayStore = useCallback(
    (enabled: boolean, optionValue: string) => {
      commitLocalUpdate(environment, store => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const dataId = (channelRef as unknown as { __id?: string }).__id;
        if (!dataId) return;
        const record = store.get(dataId);
        const preference = record?.getLinkedRecord(CHANNEL_RELAY_FIELDS.preference);
        const storeSelectedOption = preference?.getLinkedRecord(
          CHANNEL_RELAY_FIELDS.selectedOption,
        );
        if (!storeSelectedOption) return;
        storeSelectedOption.setValue(enabled, CHANNEL_RELAY_FIELDS.enabled);
        storeSelectedOption.setValue(optionValue, CHANNEL_RELAY_FIELDS.value);
      });
    },
    [environment, channelRef],
  );

  const { content: legallySensitiveContent, actions: legallySensitiveActions } =
    useLegallySensitiveContent(consentMapping);

  const { updateSetting, isPending } = useUpdateUserSetting({
    onSuccess: () => {
      // TEMPORARY: aggregate channel toggles (e.g. AggregatedDesktopNotifications)
      // cascade server-side to per-notification-type channel settings. Without a
      // Relay mutation with a declarative updater, the local store can't know about
      // those cascading changes, so we force-refetch to keep the UI in sync.
      if (usesScalarPayload) {
        refetchNotificationSettings();
      }
    },
    onError: () => {
      setIsEnabled(prev => !prev);
      updateRelayStore(
        previousEnabledRef.current,
        previousEnabledRef.current ? enabledValue : disabledValue,
      );
    },
  });

  const requiredActions = new Set(
    availableOptions.flatMap(opt => opt.requiredActions.map(a => a.actionType)),
  );
  const isReadOnly = requiredActions.has(RequirementType.ReadableButNotActionable);
  const isParentDisabled = requiredActions.has(RequirementType.ParentalConsent);
  const canToggle = availableOptions.length > 1 && !isReadOnly && !isParentDisabled;

  const handleToggle = () => {
    if (!canToggle || isPending) return;

    const newValue = !isEnabled;
    const settingValue = newValue ? enabledValue : disabledValue;
    previousEnabledRef.current = isEnabled;
    setIsEnabled(newValue);
    updateRelayStore(newValue, settingValue);

    const auditHeader =
      notificationChannel.channel.isLegallySensitive && consentMapping
        ? legallySensitiveActions.getBase64EncodedAuditHeader()
        : undefined;

    updateSetting({
      settingKey: notificationChannel.preference.setting.value,
      value: usesScalarPayload
        ? settingValue
        : {
            channelSettings: [
              {
                channelName: notificationChannel.channel.value,
                setting: settingValue,
              },
            ],
          },
      auditHeader,
    });
  };

  const channelLabelKey = resolveChannelLabelKey(notificationChannel.channel.value);
  const channelLabel = channelLabelKey ? translate(channelLabelKey) : "";
  const toggleId = `toggle-${notificationChannel.preference.setting.value}-${notificationChannel.channel.value}`;

  const channelDescriptionKey = resolveChannelDescriptionKey(notificationChannel.channel.value);
  const lowercaseLabelKey = resolveChannelLowercaseLabelKey(notificationChannel.channel.value);

  const useLegallySensitiveChannelCopy = Boolean(
    notificationChannel.channel.isLegallySensitive && consentMapping,
  );
  const { title: lscTitle, consent: lscConsent } = legallySensitiveContent.wordsOfConsent;
  const displayLabel = useLegallySensitiveChannelCopy && lscTitle ? lscTitle : channelLabel;

  const getDescription = (): string | undefined => {
    if (isParentDisabled) {
      return translate(translationConstants.parentDisabledDescription, {
        notificationChannel: lowercaseLabelKey ? translate(lowercaseLabelKey) : channelLabel,
      });
    }
    // The channel aggregate toggle is off, making this per-type channel read-only.
    if (isReadOnly) {
      return translate(translationConstants.channelDisabledDescription, {
        channel: lowercaseLabelKey ? translate(lowercaseLabelKey) : channelLabel,
      });
    }
    if (useLegallySensitiveChannelCopy && lscConsent) {
      return lscConsent;
    }
    if (channelDescriptionKey) {
      return translate(channelDescriptionKey);
    }
    return undefined;
  };

  const dimmedClassName = isParentDisabled || isReadOnly ? "content-default" : undefined;

  return (
    <SettingControlItem
      id={toggleId}
      label={displayLabel}
      description={getDescription()}
      labelClassName={dimmedClassName}
      descriptionClassName={dimmedClassName}
      control={
        <Toggle
          aria-label={displayLabel}
          size="Medium"
          placement="End"
          isChecked={isEnabled}
          onCheckedChange={handleToggle}
          isDisabled={!canToggle || isPending}
        />
      }
    />
  );
};

export default ChannelToggle;
