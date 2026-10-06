import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";
import * as z from "zod/mini";

export type ReferrerLookup = (referrerId: number) => Promise<{ name: string }>;

const referrerSchema = z.object({ name: z.string(), isBanned: z.boolean() });

const lookUpReferrer: ReferrerLookup = referrerId =>
  http
    .get(
      Url.parse(environmentUrls.usersApi).getOrThrow().withPath(`/v1/users/${referrerId}`),
      referrerSchema,
      { credentials: "include" },
    )
    .getOrThrow()
    .then(user => {
      if (user.isBanned) {
        throw new Error("Referrer is withheld");
      }
      return user;
    });

let registered: ReferrerLookup = lookUpReferrer;

/** .NET hosts register `userDataStore.getUser`, which keeps `core-scripts/data-store` out of the Next.js graph. */
export const registerReferrerLookup = (lookup: ReferrerLookup): void => {
  registered = lookup;
};

export const getReferrerLookup = (): ReferrerLookup => registered;
