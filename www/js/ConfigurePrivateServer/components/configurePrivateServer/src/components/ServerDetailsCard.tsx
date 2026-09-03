import React from "react";
import { Divider, IconButton, Toggle } from "@rbx/foundation-ui";
import type { PrivateServer } from "../types/configurePrivateServerTypes";

type ServerDetailsCardProps = {
  server: PrivateServer;
  thumbnailUrl: string | null;
  gameLink: string;
  language: {
    labelServerName: string;
    labelGame: string;
    labelSubscriptionStatus: string;
    labelSubscriptionPrice: string;
    labelRenewalDate: string;
    labelExpirationDate: string;
    labelFree: string;
  };
  onOpenChangeNameDialog: () => void;
  onToggleSubscriptionStatus: () => Promise<void>;
};

const ServerDetailsCard = ({
  server,
  thumbnailUrl,
  gameLink,
  language,
  onOpenChangeNameDialog,
  onToggleSubscriptionStatus,
}: ServerDetailsCardProps) => {
  const hasSubscription =
    Boolean(server.subscription.price) ||
    server.subscription.expired ||
    server.subscription.hasPriceChanged;

  return (
    <div className="flex flex-col medium:flex-row gap-large items-center medium:items-start">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={server.game.name}
          className="radius-medium shrink-0 [object-fit:cover] width-[256px] height-[256px]"
        />
      )}
      <div className="flex flex-col gap-small grow self-stretch">
        {/* Server Name */}
        <div className="flex items-center">
          <span className="text-body-large content-default min-width-[160px] shrink-0">
            {language.labelServerName}
          </span>
          <div className="flex items-center gap-xsmall">
            <span className="text-body-large content-emphasis">{server.name}</span>
            <IconButton
              id="edit-name-button"
              icon="icon-filled-pencil-square"
              variant="Utility"
              size="Small"
              ariaLabel="Edit server name"
              onClick={onOpenChangeNameDialog}
            />
          </div>
        </div>

        <Divider />

        {/* Experience */}
        <div className="flex items-center">
          <span className="text-body-large content-default min-width-[160px] shrink-0">
            {language.labelGame}
          </span>
          <a className="text-body-large" href={gameLink}>
            {server.game.name}
          </a>
        </div>

        <Divider />

        {/* Subscription Price */}
        <div className="flex items-center">
          <span className="text-body-large content-default min-width-[160px] shrink-0">
            {language.labelSubscriptionPrice}
          </span>
          <span className="text-body-large content-default">
            {server.subscription.price && server.subscription.price > 0 ? (
              <span className="flex items-center gap-xsmall">
                <span className="icon-robux-16x16" />
                <span>{server.subscription.price}</span>
              </span>
            ) : (
              language.labelFree
            )}
          </span>
        </div>

        {/* Subscription Status Toggle (only for paid/expired servers) */}
        {hasSubscription && (
          <React.Fragment>
            <Divider />
            <div className="flex items-center">
              {/* TODO: revisit structure for a11y, this is not ideal */}
              <span
                id="subscription-status-toggle"
                className="text-body-large content-default min-width-[160px] shrink-0"
              >
                {language.labelSubscriptionStatus}
              </span>
              <Toggle
                isChecked={server.subscription.active}
                onCheckedChange={onToggleSubscriptionStatus}
                aria-labelledby="subscription-status-toggle"
                placement="Start"
                size="Medium"
                isDisabled={!server.subscription.canRenew}
              />
            </div>
          </React.Fragment>
        )}

        {/* Renewal / Expiration Date */}
        {hasSubscription && server.subscription.expirationDate && (
          <React.Fragment>
            <Divider />
            <div className="flex items-center">
              <span className="text-body-large content-default min-width-[160px] shrink-0">
                {server.subscription.active
                  ? language.labelRenewalDate
                  : language.labelExpirationDate}
              </span>
              <span className="text-body-large content-default">
                {new Date(server.subscription.expirationDate).toLocaleDateString()}
              </span>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ServerDetailsCard;
