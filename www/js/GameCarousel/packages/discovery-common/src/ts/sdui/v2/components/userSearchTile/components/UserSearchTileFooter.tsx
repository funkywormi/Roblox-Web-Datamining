export interface UserSearchTileFooterProps {
  contextText?: string;
  username: string;
}

export function UserSearchTileFooter({
  contextText,
  username,
}: UserSearchTileFooterProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center min-width-0 width-full">
      <div className="text-caption-large content-default text-truncate-end max-width-full">
        @{username}
      </div>
      {contextText == null ? null : (
        <div className="text-body-small content-muted text-align-x-center text-no-wrap text-truncate-end max-width-full">
          {contextText}
        </div>
      )}
    </div>
  );
}
