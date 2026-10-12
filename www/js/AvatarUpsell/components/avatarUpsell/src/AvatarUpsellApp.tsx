import { name, userId } from "@rbx/core-scripts/meta/user";
import { useTranslations } from "@rbx/www-common/i18n";
import { Button } from "@rbx/foundation-ui";
import { Thumbnail2d } from "@rbx/www-common/components/thumbnail";
import { assetUrl } from "@rbx/www-common/asset";
import backgroundImage from "./images/avatar-upsell-background.svg";
import { AVATAR_THUMBNAIL_SIZE } from "./constants";
import { useDownloadLink, type UseDownloadLinkOptions } from "./hooks/useDownloadLink";

export type AvatarUpsellAppProps = UseDownloadLinkOptions;

const AvatarUpsellApp = (props: AvatarUpsellAppProps = {}) => {
  const translate = useTranslations("Feature.Avatar");
  const { protocolUrl, launchApp } = useDownloadLink(props);
  const currentUserId = userId();
  const currentUserName = name() ?? "";

  return (
    <div
      className="height-[calc(100vh-40px)] width-full flex flex-col landscape:flex-row"
      style={{ backgroundImage: `url(${assetUrl(backgroundImage)})`, backgroundSize: "cover" }}
    >
      <div className="height-[50%] width-full min-height-0 flex items-center justify-center landscape:height-full landscape:width-[50%]">
        {currentUserId != null && (
          <div
            id="UserAvatar"
            className="height-[72%] max-height-[352px] flex items-center justify-center"
          >
            <Thumbnail2d
              type="Avatar"
              targetId={currentUserId}
              size={AVATAR_THUMBNAIL_SIZE}
              format="png"
              altName={currentUserName}
              containerClassName="height-full bg-transparent"
              imgClassName="height-full width-auto margin-x-auto"
            />
          </div>
        )}
      </div>

      <div className="height-[50%] width-full min-height-0 flex items-stretch justify-center landscape:height-full landscape:width-[50%] landscape:padding-xxlarge">
        <section className="height-full width-full bg-surface-200 flex flex-col items-center padding-top-[82px] text-align-x-center">
          <h1 className="margin-none text-heading-large content-emphasis">
            {translate("Heading.AvatarPageTitle")}
          </h1>
          <p className="margin-none max-width-[300px] text-body-medium content-muted">
            {translate("Description.AvatarEditorUpsell")}
          </p>
          <Button
            as="a"
            href={protocolUrl}
            size="Large"
            variant="Standard"
            className="margin-top-small min-width-[180px] stroke-standard stroke-emphasis bg-transparent"
            onClick={launchApp}
          >
            {translate("Action.OpenRobloxApp")}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default AvatarUpsellApp;
