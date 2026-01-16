import { AppId, Duration } from "@broccoliapps/shared";
import { HttpError } from "../http";

export type AuthConfig = {
  appId: AppId;
  accessTokenLifetime: Duration;
  refreshTokenLifetime: Duration;
};

let config: AuthConfig;

export const setAuthConfig = (authConfig: AuthConfig) => {
  config = authConfig;
};

export const getAuthConfig = () => {
  if (!config) {
    throw new HttpError(500, "Auth config is not set. `auth.setConfig` is not called.");
  }
  return config;
};
