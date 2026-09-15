import React, { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as EmailValidator from "email-validator";
import { useTranslations } from "../util/translation";
import CustomModal from "../components/CustomModal";
import {
  isUrlValidForSubmission,
  isValidRobloxUrl,
  tooManyUrls,
  MAX_NUMBER_OF_CONTENTS,
} from "./helpers";
import { BrazilWomenLimits, Limit, Urls } from "./constants";
import { sendReport } from "./services";
import type { SendReportResponse, SubmitModal } from "./types";
import useGetMetadata from "./useGetMetadata";
import { getSampleRobloxUrl } from "../util/urls";
import { BrazilWomenIntimateStanding, buildBrazilWomenIntimateRequest } from "./brazilSubmission";

import FormField from "./components/FormField";
import ContactFields from "./components/ContactFields";
import PrivacyNotice from "./components/PrivacyNotice";
import BackButton from "./components/BackButton";
import Checkbox from "./components/Checkbox";
import BrazilWomenHelpline from "./components/BrazilWomenHelpline";

export { BrazilWomenIntimateStanding } from "./brazilSubmission";

export interface BrazilWomenIntimateFormProps {
  defaultContentURL?: string | null;
  onBack?: () => void;
}

/**
 * Brazil women intimate-content removal form (Decree 12,976/2026).
 * Field set mirrors US NCII. Reporter standing (affected vs authorized rep) is
 * an on-form radio group placed after contact fields, like Brazil ECA role.
 */
const BrazilWomenIntimateForm: React.FC<BrazilWomenIntimateFormProps> = ({
  defaultContentURL,
  onBack,
}) => {
  const { translate } = useTranslations();
  const { data, error } = useGetMetadata();

  const [contentLocation, setContentLocation] = useState(defaultContentURL || "");
  const [description, setDescription] = useState("");
  const [circumstances, setCircumstances] = useState("");
  const [standing, setStanding] = useState<BrazilWomenIntimateStanding | "">("");
  const [attestation, setAttestation] = useState(false);
  const [signature, setSignature] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  const clearAllInputs = useCallback(() => {
    setContentLocation("");
    setDescription("");
    setCircumstances("");
    setStanding("");
    setAttestation(false);
    setSignature("");
    setName(data?.name ?? "");
    setEmail("");
  }, [data?.name]);

  const mutation = useMutation(sendReport, {
    onSuccess: (response: SendReportResponse) => {
      if (response.success) {
        setSubmittedModalInfo({
          title: translate("Title.Modal.ReportSuccess"),
          content: translate("Message.Modal.ReportSuccess"),
          buttonText: translate("Action.Modal.SubmitAnother"),
        });
        clearAllInputs();
        return;
      }

      setSubmittedModalInfo({
        title: translate("Title.Modal.ReportFailure"),
        content: response.message || translate("Message.Modal.Error"),
        buttonText: translate("Action.Modal.Ok"),
      });
    },
    onError: (mutationError: unknown) => {
      const errorMessage =
        (mutationError as { message: string })?.message || translate("Message.Modal.Error");
      setSubmittedModalInfo({
        title: translate("Title.Modal.ReportFailure"),
        content: errorMessage,
        buttonText: translate("Action.Modal.Ok"),
      });
    },
  });

  useEffect(() => {
    if (data?.name) {
      setName(currentName => currentName || data.name);
    }
  }, [data?.name]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { message: string })?.message || translate("Message.Modal.Error");
      setSubmittedModalInfo({
        title: translate("Title.Modal.MetadataError"),
        content: errorMessage,
        buttonText: translate("Action.Modal.Ok"),
      });
    }
  }, [error, translate]);

  const getUrlError = useCallback((): string | undefined => {
    if (!contentLocation) return undefined;
    if (!isValidRobloxUrl(contentLocation)) {
      return translate("Message.UrlError");
    }
    if (tooManyUrls(contentLocation)) {
      return translate("Message.TooManyUrlError", { number: MAX_NUMBER_OF_CONTENTS.toString() });
    }
    return undefined;
  }, [contentLocation, translate]);

  const canSubmit = (): boolean => {
    return (
      isUrlValidForSubmission(contentLocation.trim()) &&
      !!description.trim() &&
      description.length <= BrazilWomenLimits.MAX_DESCRIPTION_LENGTH &&
      circumstances.length <= BrazilWomenLimits.MAX_CIRCUMSTANCES_LENGTH &&
      !!standing &&
      attestation &&
      !!signature.trim() &&
      signature.length <= BrazilWomenLimits.MAX_SIGNATURE_LENGTH &&
      !!name.trim() &&
      !!email.trim() &&
      EmailValidator.validate(email)
    );
  };

  const handleSubmit = () => {
    if (!standing || mutation.isLoading) return;

    mutation.mutate(
      buildBrazilWomenIntimateRequest({
        contentLocation,
        description,
        circumstances,
        signature,
        signatureTimestamp: new Date().toISOString(),
        standing,
        name,
        email,
      }),
    );
  };

  const handleSubmittedModalClose = () => {
    setSubmittedModalInfo(null);
  };

  const urlError = getUrlError();

  return (
    <div className="form-container">
      {onBack && <BackButton onClick={onBack} />}

      <div className="section">
        <h1>{translate("Title.BrazilIntimateContent")}</h1>
      </div>

      <div className="main-card">
        <BrazilWomenHelpline />

        <div
          id="brazil-women-intimate-description"
          className="section dsa-description brazil-form-intro"
        >
          <p>{translate("Message.BrazilIntimateContent.Description1")}</p>
          <p>{translate("Message.BrazilIntimateContent.Description2")}</p>
        </div>

        <div id="brazil-women-intimate-help-center" className="section brazil-form-help-center">
          <a
            href={Urls.BRAZIL_HELP_CENTER_ARTICLE}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            {translate("Action.BrazilIntimateContent.HelpCenter")}
          </a>
        </div>

        <div id="url-input" className="section">
          <h5>
            <label htmlFor="brazil-women-intimate-url-input">
              {translate("Label.Brazil.ContentLocation")}*
            </label>
          </h5>
          <input
            id="brazil-women-intimate-url-input"
            type="text"
            data-testid="brazil-women-intimate-url"
            className="form-control input-field"
            value={contentLocation}
            placeholder={`${translate("Message.UrlSample")}: ${getSampleRobloxUrl()}`}
            maxLength={Limit.MAX_URL_LENGTH}
            onChange={e => setContentLocation(e.target.value)}
          />
          {urlError && <span className="error-text">{urlError}</span>}
        </div>

        <FormField
          id="brazil-women-intimate-description-field"
          label={translate("Label.BrazilIntimateContent.Description")}
          value={description}
          onUpdate={setDescription}
          maxLength={BrazilWomenLimits.MAX_DESCRIPTION_LENGTH}
          rows={6}
          showRequiredStar
        />

        <FormField
          id="brazil-women-intimate-circumstances"
          label={
            <React.Fragment>
              {translate("Label.BrazilIntimateContent.Circumstances")}{" "}
              <span className="dsa-reason-limit" style={{ display: "inline" }}>
                {translate("Label.Optional")}
              </span>
            </React.Fragment>
          }
          value={circumstances}
          onUpdate={setCircumstances}
          maxLength={BrazilWomenLimits.MAX_CIRCUMSTANCES_LENGTH}
          rows={4}
        />

        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          nameLabel={translate("Label.FullLegalName")}
        />

        <div id="brazil-women-intimate-standing" className="section">
          <h5>{translate("Question.BrazilIntimateContent.Standing")}*</h5>
          <div className="custom-radio-group">
            <div className="radio-item">
              <input
                id="brazil-women-intimate-standing-affected"
                type="radio"
                name="intimate_standing"
                checked={standing === BrazilWomenIntimateStanding.AFFECTED_USER}
                onChange={() => setStanding(BrazilWomenIntimateStanding.AFFECTED_USER)}
              />
              <label htmlFor="brazil-women-intimate-standing-affected">
                <span>{translate("Label.BrazilIntimateContent.Standing.AffectedUser")}</span>
              </label>
            </div>
            <div className="radio-item">
              <input
                id="brazil-women-intimate-standing-authorized"
                type="radio"
                name="intimate_standing"
                checked={standing === BrazilWomenIntimateStanding.AUTHORIZED_REP}
                onChange={() => setStanding(BrazilWomenIntimateStanding.AUTHORIZED_REP)}
              />
              <label htmlFor="brazil-women-intimate-standing-authorized">
                <span>{translate("Label.BrazilIntimateContent.Standing.AuthorizedRep")}</span>
              </label>
            </div>
          </div>
        </div>

        <div id="brazil-women-intimate-signature" className="section">
          <h5>
            <label htmlFor="brazil-women-intimate-signature-input">
              {translate("Label.BrazilIntimateContent.ElectronicSignature")}*
            </label>
          </h5>
          <input
            id="brazil-women-intimate-signature-input"
            type="text"
            className="form-control input-field"
            value={signature}
            maxLength={BrazilWomenLimits.MAX_SIGNATURE_LENGTH}
            onChange={e => setSignature(e.target.value)}
          />
        </div>

        <Checkbox
          id="brazil-women-intimate-good-faith"
          checked={attestation}
          onChange={setAttestation}
          label={translate("Label.BrazilIntimateContent.GoodFaithAttestation")}
          className="section"
          required
        />

        <div id="submit-button" className="section" style={{ marginTop: 48 }}>
          {mutation.isLoading ? (
            <button type="button" className="btn-primary-md btn-full-width loading-button" disabled>
              <span className="loading-spinner" />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary-md btn-full-width"
              disabled={!canSubmit()}
              onClick={handleSubmit}
            >
              {translate("Action.Submit")}
            </button>
          )}
        </div>

        <PrivacyNotice />
      </div>

      <CustomModal
        open={!!submittedModalInfo}
        onClose={handleSubmittedModalClose}
        title={submittedModalInfo?.title}
        content={submittedModalInfo?.content}
      >
        <button
          type="button"
          className="btn-control-md btn-full-width white-space-button"
          onClick={handleSubmittedModalClose}
        >
          {submittedModalInfo?.buttonText}
        </button>
      </CustomModal>
    </div>
  );
};

export default BrazilWomenIntimateForm;
