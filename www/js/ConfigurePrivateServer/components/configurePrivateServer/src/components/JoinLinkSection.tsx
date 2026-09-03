import { Button, IconButton, TextInput } from "@rbx/foundation-ui";

type JoinLinkSectionProps = {
  active: boolean;
  joinLink?: string;
  displayPrivacyDisclaimer: boolean;
  privateServerLinkText: string;
  generateText: string;
  regenerateText: string;
  joinGameLinkText: string;
  privacySettingsText: string;
  privacyDisclaimerText: string;
  privacyRedirectLink: string;
  onUpdateJoinLink: () => Promise<void>;
};

const JoinLinkSection = ({
  active,
  joinLink,
  displayPrivacyDisclaimer,
  privateServerLinkText,
  generateText,
  regenerateText,
  joinGameLinkText,
  privacySettingsText,
  privacyDisclaimerText,
  privacyRedirectLink,
  onUpdateJoinLink,
}: JoinLinkSectionProps) => {
  const copyJoinLink = async () => {
    if (!joinLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(joinLink);
    } catch {
      // no-op
    }
  };

  return (
    <div className="flex flex-col gap-medium">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-title-large content-emphasis">{privateServerLinkText}</span>
        <Button
          id="generate-link-button"
          variant="Standard"
          size="Medium"
          isDisabled={!active || displayPrivacyDisclaimer}
          onClick={() => {
            onUpdateJoinLink();
          }}
        >
          {joinLink ? regenerateText : generateText}
        </Button>
      </div>

      {/* Link input + copy */}
      <TextInput
        id="join-link"
        readOnly
        placeholder={joinGameLinkText}
        value={joinLink ?? ""}
        trailingIconNode={
          <IconButton
            id="copy-game-link"
            icon="icon-filled-page"
            variant="Utility"
            size="Small"
            ariaLabel="Copy link"
            isDisabled={!active || !joinLink || displayPrivacyDisclaimer}
            onClick={() => {
              copyJoinLink();
            }}
          />
        }
      />

      {/* Privacy disclaimer */}
      {displayPrivacyDisclaimer && (
        <p className="text-body-large content-default">
          <span id="privacy-disclaimer">{privacyDisclaimerText}</span>{" "}
          <a id="privacy-settings-redirect" href={privacyRedirectLink}>
            {privacySettingsText}
          </a>
        </p>
      )}
    </div>
  );
};

export default JoinLinkSection;
