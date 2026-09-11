import { downcast, SubType } from "@rbx/core-lib";

/** A 2 letter country code string that is taken from Request Context. */
export type CountryCode = SubType<"CountryCode", string>;

/** Parse a string into a {@link CountryCode}. Returns an empty string unless it is exactly two ASCII letters. */
export const parseCountryCode = (str: string): CountryCode =>
  downcast(/^[A-Za-z]{2}$/.test(str) ? str.toUpperCase() : "");
