import React, { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as EmailValidator from "email-validator";
import { useTranslations } from "../util/translation";
import CustomModal from "../components/CustomModal";
import { isUrlValidForSubmission, isValidRobloxUrl, tooManyUrls } from "./helpers";
import { Limit, Urls } from "./constants";
import { sendReport } from "./services";
import type { SendReportResponse, SubmitModal } from "./types";
import useGetMetadata from "./useGetMetadata";
import { getSampleRobloxUrl } from "../util/urls";
import {
  BrazilAdsAdType,
  BrazilAdsReporterType,
  buildBrazilAdsRequest,
  isBrazilAdsAuthorityReporter,
} from "./brazilSubmission";

import FormField from "./components/FormField";
import ContactFields from "./components/ContactFields";
import PrivacyNotice from "./components/PrivacyNotice";
import BackButton from "./components/BackButton";
import Checkbox from "./components/Checkbox";

export {
  BrazilAdsAdType,
  BrazilAdsReporterType,
  isBrazilAdsAuthorityReporter,
} from "./brazilSubmission";

interface SelectOptionItem<T extends string> {
  value: T;
  label: string;
  description?: string;
}

const MAX_AUTHORITY_REFERENCE_LENGTH = 100;
const MAX_NUMBER_OF_AD_LOCATIONS = 1;

export interface BrazilAdsFormProps {
  defaultContentURL?: string | null;
  onBack?: () => void;
}

/**
 * Brazil unlawful/misleading/abusive advertising report form (Decree 12,975/2026).
 * Field order mirrors Brazil ECA: ad type → location → description → contact → reporter type.
 */
const BrazilAdsForm: React.FC<BrazilAdsFormProps> = ({ defaultContentURL, onBack }) => {
  const { translate } = useTranslations();
  const { data, error } = useGetMetadata();

  const [adLocation, setAdLocation] = useState(defaultContentURL || "");
  const [description, setDescription] = useState("");
  const [adType, setAdType] = useState<BrazilAdsAdType | "">("");
  const [reporterType, setReporterType] = useState<BrazilAdsReporterType | "">("");
  const [authorityReferenceNumber, setAuthorityReferenceNumber] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  const clearAllInputs = useCallback(() => {
    setAdLocation("");
    setDescription("");
    setAdType("");
    setReporterType("");
    setAuthorityReferenceNumber("");
    setIsConfirmed(false);
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

  const adTypeOptions: SelectOptionItem<BrazilAdsAdType>[] = [
    {
      value: BrazilAdsAdType.MISLEADING,
      label: translate("Label.BrazilAds.Type.Misleading"),
      description: translate("Message.BrazilAds.Type.Misleading"),
    },
    {
      value: BrazilAdsAdType.ABUSIVE,
      label: translate("Label.BrazilAds.Type.Abusive"),
      description: translate("Message.BrazilAds.Type.Abusive"),
    },
    {
      value: BrazilAdsAdType.FRAUDULENT,
      label: translate("Label.BrazilAds.Type.Fraudulent"),
      description: translate("Message.BrazilAds.Type.Fraudulent"),
    },
  ];

  const reporterTypeOptions: SelectOptionItem<BrazilAdsReporterType>[] = [
    {
      value: BrazilAdsReporterType.INDIVIDUAL_USER,
      label: translate("Label.BrazilAds.ReporterType.IndividualUser"),
    },
    {
      value: BrazilAdsReporterType.NATIONAL_CONSUMER_DEFENSE_SYSTEM,
      label: translate("Label.BrazilAds.ReporterType.NationalConsumerDefenseSystem"),
    },
    {
      value: BrazilAdsReporterType.FEDERAL_ATTORNEY_GENERALS_OFFICE,
      label: translate("Label.BrazilAds.ReporterType.FederalAttorneyGeneralsOffice"),
    },
    {
      value: BrazilAdsReporterType.OTHER_AUTHORITY,
      label: translate("Label.BrazilAds.ReporterType.OtherCompetentAuthority"),
    },
    {
      value: BrazilAdsReporterType.OTHER,
      label: translate("Label.BrazilAds.ReporterType.Other"),
    },
  ];

  const showAuthorityReference = isBrazilAdsAuthorityReporter(reporterType);

  const handleReporterTypeChange = (value: BrazilAdsReporterType) => {
    setReporterType(value);
    if (!isBrazilAdsAuthorityReporter(value)) {
      setAuthorityReferenceNumber("");
    }
  };

  const getUrlError = useCallback((): string | undefined => {
    if (!adLocation) return undefined;
    if (!isValidRobloxUrl(adLocation)) {
      return translate("Message.UrlError");
    }
    if (tooManyUrls(adLocation, MAX_NUMBER_OF_AD_LOCATIONS)) {
      return translate("Message.TooManyUrlError", {
        number: MAX_NUMBER_OF_AD_LOCATIONS.toString(),
      });
    }
    return undefined;
  }, [adLocation, translate]);

  const canSubmit = (): boolean => {
    return (
      isUrlValidForSubmission(adLocation.trim()) &&
      !tooManyUrls(adLocation.trim(), MAX_NUMBER_OF_AD_LOCATIONS) &&
      !!description.trim() &&
      description.length <= Limit.MAX_DESCRIPTION_LENGTH &&
      !!adType &&
      !!reporterType &&
      authorityReferenceNumber.length <= MAX_AUTHORITY_REFERENCE_LENGTH &&
      isConfirmed &&
      !!name.trim() &&
      !!email.trim() &&
      EmailValidator.validate(email)
    );
  };

  const handleSubmit = () => {
    if (!adType || !reporterType || mutation.isLoading) return;

    mutation.mutate(
      buildBrazilAdsRequest({
        contentLocation: adLocation,
        description,
        adType,
        reporterType,
        authorityReferenceNumber,
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
        <h1>{translate("Title.BrazilAds")}</h1>
      </div>

      <div className="main-card">
        <div id="brazil-ads-description" className="section dsa-description brazil-form-intro">
          <p>{translate("Message.BrazilAds.Description1")}</p>
        </div>

        <div id="brazil-ads-help-center" className="section brazil-form-help-center">
          <a
            href={Urls.BRAZIL_HELP_CENTER_ARTICLE}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            {translate("Action.BrazilAds.HelpCenter")}
          </a>
        </div>

        <div id="brazil-ads-ad-type" data-testid="brazil-ads-ad-type" className="section">
          <h5>{translate("Question.BrazilAds.Type")}*</h5>
          <div className="custom-radio-group brazil-ads-type-options">
            {adTypeOptions.map(option => {
              const id = `brazil-ads-type-${option.value}`;
              return (
                <div key={option.value} className="radio-item">
                  <input
                    id={id}
                    type="radio"
                    name="brazil_ads_ad_type"
                    checked={adType === option.value}
                    onChange={() => setAdType(option.value)}
                  />
                  <label htmlFor={id} className="brazil-ads-type-option">
                    <span className="brazil-ads-type-option__copy">
                      <span className="brazil-ads-type-option__title">{option.label}</span>
                      {option.description && (
                        <span className="brazil-ads-type-option__description">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div id="brazil-ads-location" className="section">
          <h5>
            <label htmlFor="brazil-ads-location-input">
              {translate("Label.BrazilAds.Location")}*
            </label>
          </h5>
          <p className="dsa-reason-limit">{translate("Message.BrazilAds.LocationHelper")}</p>
          <input
            id="brazil-ads-location-input"
            type="text"
            data-testid="brazil-ads-location"
            className="form-control input-field"
            value={adLocation}
            placeholder={`${translate("Message.UrlSample")}: ${getSampleRobloxUrl()}`}
            maxLength={Limit.MAX_URL_LENGTH}
            onChange={e => setAdLocation(e.target.value)}
          />
          {urlError && <span className="error-text">{urlError}</span>}
        </div>

        <FormField
          id="brazil-ads-description-field"
          label={translate("Label.BrazilAds.Description")}
          value={description}
          onUpdate={setDescription}
          maxLength={Limit.MAX_DESCRIPTION_LENGTH}
          rows={6}
          showRequiredStar
        />

        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          nameLabel={translate("Label.FullLegalName")}
        />

        <div
          id="brazil-ads-reporter-type"
          data-testid="brazil-ads-reporter-type"
          className="section"
        >
          <h5>{translate("Question.BrazilAds.ReporterType")}*</h5>
          <div className="custom-radio-group">
            {reporterTypeOptions.map(option => {
              const id = `brazil-ads-reporter-${option.value}`;
              return (
                <div key={option.value} className="radio-item">
                  <input
                    id={id}
                    type="radio"
                    name="brazil_ads_reporter_type"
                    checked={reporterType === option.value}
                    onChange={() => handleReporterTypeChange(option.value)}
                  />
                  <label htmlFor={id}>
                    <span>{option.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {showAuthorityReference && (
          <div id="brazil-ads-authority-reference" className="section">
            <h5>
              <label htmlFor="brazil-ads-authority-reference-input">
                {translate("Label.BrazilAds.AuthorityReferenceNumber")}{" "}
                <span className="dsa-reason-limit" style={{ display: "inline" }}>
                  {translate("Label.Optional")}
                </span>
              </label>
            </h5>
            <input
              id="brazil-ads-authority-reference-input"
              type="text"
              data-testid="brazil-ads-authority-reference"
              className="form-control input-field"
              value={authorityReferenceNumber}
              maxLength={MAX_AUTHORITY_REFERENCE_LENGTH}
              onChange={e => setAuthorityReferenceNumber(e.target.value)}
            />
          </div>
        )}

        <Checkbox
          id="brazil-ads-confirmation"
          checked={isConfirmed}
          onChange={setIsConfirmed}
          label={translate("Message.Brazil.Confirm")}
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

export default BrazilAdsForm;
