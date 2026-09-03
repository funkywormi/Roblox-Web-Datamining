import React from "react";
import { Button } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { useTranslation } from "@rbx/core-scripts/react";
import serverListConstants from "../../../../js/serverList/constants/serverListConstants";
import SectionHeader from "./SectionHeader";

const { resources } = serverListConstants;

type CreatePlayerHostedEventRowProps = {
  universeId: number;
};

const CreatePlayerHostedEventRow = ({
  universeId,
}: CreatePlayerHostedEventRowProps): React.ReactElement => {
  const { translate } = useTranslation();

  return (
    <div className="margin-bottom-large">
      <div className="flex flex-col gap-large width-full">
        <SectionHeader
          title={translate(resources.createPlayerHostedEventText)}
          subtitle={translate(resources.playerHostedEventSubtitle)}
        />

        <div className="flex flex-col width-full">
          <div className="flex flex-col gap-small padding-top-medium width-full large:flex-row large:wrap large:items-center">
            <div className="flex items-center gap-medium min-width-0 fill">
              <div className="grow-0 shrink-0 basis-auto width-[72px] height-[72px]">
                <Thumbnail2d
                  type={ThumbnailTypes.gameIcon}
                  targetId={universeId}
                  containerClass="radius-medium clip"
                  imgClassName="size-full"
                />
              </div>
              <div className="flex flex-col min-width-0">
                <p className="text-title-medium content-emphasis text-truncate-end">
                  {translate(resources.createPlayerHostedEventCardTitle)}
                </p>
                <p className="text-body-medium content-muted">
                  {translate(resources.createPlayerHostedEventCardSubtitle)}
                </p>
              </div>
            </div>

            <div className="grow-0 shrink-0 basis-auto width-full large:width-[200px]">
              <Button
                variant="Emphasis"
                size="Medium"
                className="width-full"
                as="a"
                href={`/player-hosted-events/create?universeId=${universeId}`}
              >
                {translate(resources.createText)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlayerHostedEventRow;
