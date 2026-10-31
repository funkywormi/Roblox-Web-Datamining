import React from "react";
import { DialogBody } from "@rbx/foundation-ui";
import ChallengeDialog from "./challengeDialog";
import { ChallengeDialogHeader, HeaderButtonType } from "./challengeDialogHeader";
import InlineChallengeBody from "./inlineChallengeBody";
import { FooterButtonConfig, ChallengeDialogFooter } from "./challengeDialogFooter";
import { InlineChallengeFooter, InlineFooterButtonConfig } from "./inlineChallengeFooter";
import InlineChallenge from "./inlineChallenge";

type Props = {
  renderInline: boolean;
  isConfirmationModalVisible: boolean;
  confirmAbandonLabel: string;
  rejectAbandonLabel: string;
  abandonConfirmationTitle: string;
  abandonConfirmationDescription: string;
  handleContinue: () => void | Promise<void>;
  handleConfirmAbandon: () => void | Promise<void>;
};

const getPageContent = (
  renderInline: boolean,
  abandonConfirmationBody: string,
  continueButton: InlineFooterButtonConfig,
  abandonButton: InlineFooterButtonConfig | null,
) => {
  const BodyElement = renderInline ? InlineChallengeBody : DialogBody;
  const FooterElement = renderInline ? InlineChallengeFooter : ChallengeDialogFooter;
  return (
    <React.Fragment>
      <BodyElement>
        <p>{abandonConfirmationBody}</p>
      </BodyElement>
      <FooterElement positiveButton={continueButton} negativeButton={abandonButton} />
    </React.Fragment>
  );
};

const QuitVerificationConfirmation: React.FC<Props> = ({
  renderInline,
  confirmAbandonLabel,
  rejectAbandonLabel,
  abandonConfirmationTitle,
  abandonConfirmationDescription,
  isConfirmationModalVisible,
  handleContinue,
  handleConfirmAbandon,
}: Props) => {
  const abandonButton: FooterButtonConfig = {
    content: rejectAbandonLabel,
    label: rejectAbandonLabel,
    enabled: true,
    action: handleContinue,
  };

  const continueButton: FooterButtonConfig = {
    content: confirmAbandonLabel,
    label: confirmAbandonLabel,
    enabled: true,
    action: handleConfirmAbandon,
  };

  return (
    <React.Fragment>
      {renderInline ? (
        <InlineChallenge titleText={abandonConfirmationTitle}>
          {getPageContent(
            renderInline,
            abandonConfirmationDescription,
            continueButton,
            abandonButton,
          )}
        </InlineChallenge>
      ) : (
        <ChallengeDialog open={isConfirmationModalVisible} onClose={handleConfirmAbandon}>
          <ChallengeDialogHeader
            headerText={abandonConfirmationTitle}
            buttonType={HeaderButtonType.CLOSE}
            buttonAction={handleConfirmAbandon}
            buttonEnabled
            headerInfo={null}
          />
          {getPageContent(
            renderInline,
            abandonConfirmationDescription,
            continueButton,
            abandonButton,
          )}
        </ChallengeDialog>
      )}
    </React.Fragment>
  );
};

export default QuitVerificationConfirmation;
