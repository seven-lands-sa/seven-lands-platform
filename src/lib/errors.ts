import { APIError } from "payload";

/**
 * An `APIError` whose public message survives a production build — use it for every error text a
 * human is meant to read.
 *
 * Payload decides whether to show an error message by checking `error.name`
 * (`node_modules/payload/dist/utilities/formatErrors.js`). The name is assigned from
 * `this.constructor.name` — and in a minified production bundle that constructor is anonymous, so the
 * name comes out as `""`, the check fails, and every carefully written Arabic message turns into
 * "An unknown error occurred." (measured: Phase D, production build, before this helper).
 *
 * Setting the name explicitly is the whole fix. Without it the message is only visible in dev.
 */
export const publicError = (message: string, status = 400): APIError => {
  const error = new APIError(message, status);
  error.name = "APIError";
  return error;
};
