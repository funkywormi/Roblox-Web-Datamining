import { useTranslation } from "@rbx/core-scripts/react";

type EmptyStatesProps = {
  keyword: string;
  keywordMinLength: number;
  showNoMatches: boolean;
  showKeywordTooShort: boolean;
  showUnsafeInput: boolean;
};

const emptyStateClassName =
  "bg-surface-100 content-muted radius-medium stroke-standard stroke-muted padding-large";

const EmptyStateMessage = ({ message }: { message: string }): React.JSX.Element => {
  return <div className={emptyStateClassName}>{message}</div>;
};

const EmptyStates = ({
  keyword,
  keywordMinLength,
  showNoMatches,
  showKeywordTooShort,
  showUnsafeInput,
}: EmptyStatesProps): React.JSX.Element | null => {
  const { translate } = useTranslation();
  const noMatchesMessage = translate("Label.NoMatchesAvailable", { keyword });
  const minCharactersMessage = translate("Label.EnterMinCharacters", { keywordMinLength });
  const unsafeInputMessage = translate("Label.UnsafeInput");

  if (!showNoMatches && !showKeywordTooShort && !showUnsafeInput) {
    return null;
  }

  return (
    <div className="flex flex-col gap-medium">
      {showNoMatches ? <EmptyStateMessage message={noMatchesMessage} /> : null}
      {showKeywordTooShort ? <EmptyStateMessage message={minCharactersMessage} /> : null}
      {showUnsafeInput ? <EmptyStateMessage message={unsafeInputMessage} /> : null}
    </div>
  );
};

export default EmptyStates;
