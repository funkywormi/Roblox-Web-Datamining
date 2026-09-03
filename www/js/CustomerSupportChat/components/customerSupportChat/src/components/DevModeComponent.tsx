import React, { useState, useEffect, useContext } from "react";
import { Button, Toggle, TextArea } from "@rbx/foundation-ui";
import {
  SupportTicketSelectableItems,
  SupportTicketStateKey,
  SupportTicketSelectableItemKeys,
} from "../core/types/supportTicket";
import {
  SupportFormState,
  SelectedItems,
  SupportContextKey,
  SupportedReceivedValues,
} from "../core/types/common";
import { SupportContext } from "../providers/SupportContextProvider";

interface DevModeConfig {
  jsonInput: string;
  isDevPanelEnabled: boolean;
  supportedReceived: SupportedReceivedValues | null;
  autoResolveTicket: boolean;
  orchestrationVersionOverride: string | null;
}
// String constants to avoid jsx-no-literals errors
const DEV_MODE_LABEL = "Open Dev Mode Control Panel";
const DEV_PANEL_TITLE = "Dev Mode Control Panel";
const DROPDOWN_INSTRUCTION = "For dropdowns, use index numbers starting from 0.";
const AUTOFILL_BUTTON_TEXT = "Autofill Form";
const RESET_TO_DEFAULT_BUTTON_TEXT = "Reset to Default";
const SUPPORTED_RECEIVED_LABEL = "Choose Support Received:";
const AUTO_RESOLVE_TICKET_TOGGLE_LABEL = "Auto Resolve Ticket";
const ORCHESTRATION_VERSION_OVERRIDE_LABEL = "Orchestration Version Override:";
const LOCALSTORAGE_DEV_CONFIG_KEY = "roblox-support-form-dev-config";

const ORCH_VERSION_OPTIONS = [
  { value: "none", label: "None (no override)" },
  { value: "Default", label: "Default" },
  { value: "SmartTriage", label: "SmartTriage" },
  { value: "SmartTriagePlusOrchestrationV2", label: "SmartTriagePlusOrchestrationV2" },
];

const SUPPORTED_RECEIVED_OPTIONS = [
  { value: "default", label: "Default behavior (No Special treatment, Same as normal user)" },
  {
    value: SupportedReceivedValues.SierraChat,
    label: "SierraChat",
  },
  {
    value: SupportedReceivedValues.StandardTicket,
    label: "StandardTicket",
  },
  {
    value: SupportedReceivedValues.SierraU13Email,
    label: "SierraU13Email",
  },
  {
    value: SupportedReceivedValues.C3U13Email,
    label: "C3U13Email",
  },
  { value: SupportedReceivedValues.C3Chat, label: "C3Chat" },
];

// Dropdown vaule is index based, starting from 0
const DEFAULT_JSON_EXAMPLE = {
  username: "testuser123",
  firstName: "John",
  email: "john.doe@example.com",
  confirmEmail: "john.doe@example.com",
  deviceType: 0,
  helpCategoryType: 0,
  helpSubCategoryType: 0,
  message: "This is a test message for development purposes",
};

const DEFAULT_DEV_MODE_CONFIG: DevModeConfig = {
  jsonInput: JSON.stringify(DEFAULT_JSON_EXAMPLE, null, 2),
  isDevPanelEnabled: false,
  supportedReceived: null,
  autoResolveTicket: false,
  orchestrationVersionOverride: null,
};

const loadDevModeConfig = (): DevModeConfig => {
  try {
    const savedConfig = localStorage.getItem(LOCALSTORAGE_DEV_CONFIG_KEY);
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig) as Partial<DevModeConfig>;

      // Validate that jsonInput is valid JSON
      if (parsedConfig.jsonInput) {
        JSON.parse(parsedConfig.jsonInput);
      }

      return {
        jsonInput: parsedConfig.jsonInput || DEFAULT_DEV_MODE_CONFIG.jsonInput,
        isDevPanelEnabled: Boolean(parsedConfig.isDevPanelEnabled),
        supportedReceived:
          parsedConfig.supportedReceived ?? DEFAULT_DEV_MODE_CONFIG.supportedReceived,
        autoResolveTicket:
          parsedConfig.autoResolveTicket ?? DEFAULT_DEV_MODE_CONFIG.autoResolveTicket,
        orchestrationVersionOverride:
          parsedConfig.orchestrationVersionOverride ??
          DEFAULT_DEV_MODE_CONFIG.orchestrationVersionOverride,
      };
    }
  } catch (error) {
    console.error("Error loading dev mode config from localStorage:", error);
    localStorage.removeItem(LOCALSTORAGE_DEV_CONFIG_KEY);
  }

  return DEFAULT_DEV_MODE_CONFIG;
};
const saveDevModeConfig = (partialConfig: Partial<DevModeConfig>): void => {
  const existingConfig = loadDevModeConfig();
  const mergedConfig: DevModeConfig = {
    ...existingConfig,
    ...partialConfig,
  };
  localStorage.setItem(LOCALSTORAGE_DEV_CONFIG_KEY, JSON.stringify(mergedConfig));
};

interface DevModeComponentProps {
  setSupportFormData: React.Dispatch<React.SetStateAction<SupportFormState>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectedItems<SupportTicketStateKey>>>;
  selector: SupportTicketSelectableItems;
  setDirty: React.Dispatch<React.SetStateAction<Partial<Record<SupportTicketStateKey, boolean>>>>;
  currentSupportFormData: SupportFormState;
  currentSelectedItems: SelectedItems<SupportTicketStateKey>;
}

const DevModeComponent: React.FC<DevModeComponentProps> = ({
  setSupportFormData,
  setSelectedItems,
  setDirty,
  selector,
  currentSupportFormData,
  currentSelectedItems,
}) => {
  const { metadata, updateSupportInquiryContext } = useContext(SupportContext);
  const initialConfig = loadDevModeConfig();
  const [isDevPanelEnabled, setIsDevPanelEnabled] = useState(initialConfig.isDevPanelEnabled);
  const [jsonInput, setJsonInput] = useState<string>(initialConfig.jsonInput);
  const [supportedReceived, setSupportedReceived] = useState<SupportedReceivedValues | null>(
    initialConfig.supportedReceived,
  );
  const [autoResolveTicket, setAutoResolveTicket] = useState<boolean>(
    initialConfig.autoResolveTicket,
  );
  const [orchestrationVersionOverride, setOrchestrationVersionOverride] = useState<string | null>(
    initialConfig.orchestrationVersionOverride,
  );
  const [jsonError, setJsonError] = useState<string>("");
  const [autofillFormData, setAutofillFormData] = useState<
    Partial<Record<SupportTicketStateKey | SupportTicketSelectableItemKeys, string | number>>
  >({});
  const [isAutofillCompleted, setIsAutofillCompleted] = useState(true);

  // update submission url based on supported received selection
  useEffect(() => {
    if (metadata) {
      const urlObj = new URL(metadata.submitFormUrl, window.location.origin);
      if (supportedReceived !== null) {
        urlObj.searchParams.set(
          "supportReceivedOverride",
          SupportedReceivedValues[supportedReceived],
        );
      } else {
        urlObj.searchParams.delete("supportReceivedOverride");
      }

      urlObj.searchParams.set("autoResolveTicket", autoResolveTicket.toString());

      if (
        supportedReceived === SupportedReceivedValues.C3Chat &&
        orchestrationVersionOverride !== null
      ) {
        urlObj.searchParams.set("orchVersionOverride", orchestrationVersionOverride);
      } else {
        urlObj.searchParams.delete("orchVersionOverride");
      }

      if (urlObj.toString() !== metadata.submitFormUrl) {
        updateSupportInquiryContext({
          [SupportContextKey.Metadata]: {
            ...metadata,
            submitFormUrl: urlObj.toString(),
          },
        });
      }
    }
  }, [autoResolveTicket, metadata, orchestrationVersionOverride, supportedReceived]);

  // autofill form data once
  useEffect(() => {
    if (isAutofillCompleted) {
      return;
    }
    const autofillFormDataEntries = Object.entries(autofillFormData) as [
      SupportTicketStateKey,
      string | number,
    ][];
    let anyFieldUpdated = false;

    autofillFormDataEntries
      .filter(([, value]) => typeof value === "string" && value.trim() !== "")
      .forEach(([key, value]) => {
        if (currentSupportFormData[key] !== value) {
          anyFieldUpdated = true;
          setDirty(prevDirty => ({ ...prevDirty, [key]: true }));
          setSupportFormData(prevData => ({ ...prevData, [key]: value as string }));
        }
      });

    autofillFormDataEntries
      .filter(([, value]) => typeof value === "number" && value >= 0)
      .forEach(([key, value]) => {
        const selectedItem =
          selector[key as SupportTicketSelectableItemKeys]?.items[value as number];
        if (selectedItem && currentSelectedItems[key]?.id !== selectedItem.id) {
          anyFieldUpdated = true;
          setSelectedItems(prevItems => ({ ...prevItems, [key]: selectedItem }));
        }
      });

    // this will make sure we only autofill once per click
    if (!anyFieldUpdated) {
      setIsAutofillCompleted(true);
    }
  }, [
    autofillFormData,
    currentSupportFormData,
    currentSelectedItems,
    setSupportFormData,
    setSelectedItems,
    setDirty,
    selector,
    isAutofillCompleted,
  ]);

  const textareaClassName =
    "w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClassName = "block font-bold text-xs mb-1";
  const autofillButtonClassName =
    "px-2 py-1 text-xs rounded border-0 cursor-pointer bg-green-500 text-white hover:bg-green-600";
  const panelClassName =
    "rounded-lg border-2 border-blue-600 bg-surface-300 p-4 font-mono text-xs shadow-lg";
  const errorClassName = "text-red-500 text-xs mt-1";

  return (
    <React.Fragment>
      <div className="left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm flex-col items-center justify-center shadow-sm md:w-[650px]">
        <label
          htmlFor="dev-mode-checkbox"
          className="flex items-center cursor-pointer text-yellow-800 font-medium"
        >
          <input
            id="dev-mode-checkbox"
            type="checkbox"
            checked={isDevPanelEnabled}
            onChange={event => {
              setIsDevPanelEnabled(event.target.checked);
              saveDevModeConfig({
                isDevPanelEnabled: event.target.checked,
              });
            }}
            className="mr-2 cursor-pointer"
          />
          {DEV_MODE_LABEL}
        </label>
        <div className="text-xs content-inverse-default mt-1 font-bold">
          (Dev mode is only enabled for logged-in users with verified Roblox email address)
        </div>
      </div>

      {isDevPanelEnabled && (
        <div
          className={`fixed top-16 right-3 z-40 max-w-md max-h-[80vh] overflow-auto ${panelClassName}`}
        >
          <div className="mb-4">
            <strong className="text-blue-600 text-sm">{DEV_PANEL_TITLE}</strong>
          </div>

          <div className="space-y-2">
            <div className={labelClassName}>{DROPDOWN_INSTRUCTION}</div>
            <TextArea
              label="JSON Input"
              placeholder="Enter JSON configuration"
              hasError={!!jsonError}
              size="Medium"
              value={jsonInput}
              onChange={event => {
                setJsonInput(event.target.value);
                setJsonError("");
              }}
              rows={12}
            />
            {jsonError && <div className={errorClassName}>{jsonError}</div>}

            <div className="flex justify-left gap-2 mt-2">
              <Button
                variant="Emphasis"
                size="Medium"
                onClick={() => {
                  try {
                    const parsedFormData = JSON.parse(jsonInput) as Record<
                      SupportTicketStateKey,
                      string | number
                    >;
                    setAutofillFormData(parsedFormData);
                    setJsonError("");
                    setIsAutofillCompleted(false);
                    saveDevModeConfig({ jsonInput });
                  } catch (error) {
                    // Handle JSON parsing error silently in dev mode
                    setJsonError("Invalid JSON format. Please check your syntax.");
                    setIsAutofillCompleted(true);
                  }
                }}
                className="padding-medium grow-0 shrink-0 basis-auto"
              >
                {AUTOFILL_BUTTON_TEXT}{" "}
              </Button>
              <Button
                variant="Alert"
                size="Medium"
                onClick={() => {
                  const defaultJson = JSON.stringify(DEFAULT_JSON_EXAMPLE, null, 2);
                  setJsonInput(defaultJson);
                  setJsonError("");
                  saveDevModeConfig({ jsonInput: defaultJson });
                }}
                className="padding-medium grow-0 shrink-0 basis-auto"
              >
                {RESET_TO_DEFAULT_BUTTON_TEXT}
              </Button>
            </div>
            <div className={labelClassName}>{SUPPORTED_RECEIVED_LABEL}</div>
            <select
              value={supportedReceived == null ? "default" : supportedReceived}
              onChange={event => {
                const { value } = event.target;
                const selectedValue =
                  value === "default" ? null : (Number(value) as SupportedReceivedValues);
                setSupportedReceived(selectedValue);
                saveDevModeConfig({ supportedReceived: selectedValue });
              }}
              className={textareaClassName}
            >
              {SUPPORTED_RECEIVED_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {supportedReceived === SupportedReceivedValues.C3Chat && (
              <div className="mt-2">
                <div className={labelClassName}>{ORCHESTRATION_VERSION_OVERRIDE_LABEL}</div>
                <select
                  value={orchestrationVersionOverride ?? "none"}
                  onChange={event => {
                    const { value } = event.target;
                    const selectedValue = value === "none" ? null : value;
                    setOrchestrationVersionOverride(selectedValue);
                    saveDevModeConfig({ orchestrationVersionOverride: selectedValue });
                  }}
                  className={textareaClassName}
                >
                  {ORCH_VERSION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-2">
              <Toggle
                isChecked={autoResolveTicket}
                label={AUTO_RESOLVE_TICKET_TOGGLE_LABEL}
                placement="Start"
                onCheckedChange={(isChecked: boolean) => {
                  setAutoResolveTicket(isChecked);
                  saveDevModeConfig({
                    autoResolveTicket: isChecked,
                  });
                }}
                size="Medium"
              />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default DevModeComponent;
