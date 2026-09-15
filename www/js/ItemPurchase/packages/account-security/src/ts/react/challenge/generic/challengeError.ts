import { ChallengeErrorData, ChallengeErrorKind, ChallengeErrorParameters } from "./interface";

const GCS_CLASSNAME = "generic-challenge-error";

/**
 * Error type propagating failures from a generic challenge interceptor.
 *
 * Lives in its own module (split out of `./index.ts`) so consumers can import it
 * without pulling in `index.ts`'s `Roblox` global / fingerprint / request-service
 * imports.
 */
export class ChallengeError<P extends ChallengeErrorParameters = ChallengeErrorParameters>
  extends Error
  implements ChallengeError<P>
{
  /**
   * Helper function to match against any errors returned from the Generic
   * Challenge Flow.
   */
  public static match(error: unknown): error is ChallengeError {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    // eslint-disable-next-line no-underscore-dangle
    const maybeGcsErrorClass = (error as { _className?: string })._className;
    return maybeGcsErrorClass === GCS_CLASSNAME;
  }

  /**
   * Helper function to match against any challenge abandons returned from the
   * Generic Challenge Flow.
   */
  public static matchAbandoned(error: unknown): error is ChallengeError<{
    kind: ChallengeErrorKind.ABANDONED;
    data: ChallengeErrorData<ChallengeErrorKind.ABANDONED>;
  }> {
    return ChallengeError.match(error) && error.parameters.kind === ChallengeErrorKind.ABANDONED;
  }

  private static getMessage(parameters: ChallengeErrorParameters): string {
    return `Got (${[
      `Kind: ${parameters.kind}`,
      `Type: ${parameters.data.challengeType || "unknown"}`,
      `Code: ${
        parameters.kind === ChallengeErrorKind.INVALIDATED ? parameters.data.errorCode : "null"
      }`,
    ].join("; ")})`;
  }

  private _parameters: P;

  public get parameters(): P {
    return this._parameters;
  }

  // We can't use symbols because some parts of Roblox still run on IE11.
  private _className: string;

  constructor(parameters: P) {
    super(ChallengeError.getMessage(parameters));
    Object.setPrototypeOf(this, ChallengeError.prototype);
    this.name = ChallengeError.name;
    this._parameters = parameters;
    // TODO: Convert this to a Symbol once we're fully migrated off of IE11.
    this._className = GCS_CLASSNAME;
  }
}
