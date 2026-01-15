import { setAuthConfig } from "./config";
import { authToken } from "./token";

export type { AuthTokens } from "./token";

export const auth = {
  setConfig: setAuthConfig,
  ...authToken,
};
