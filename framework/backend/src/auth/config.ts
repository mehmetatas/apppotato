import { Duration } from "@broccoliapps/shared";
import { HttpError } from "../http";

export type AuthConfig = {
  app: string;
  accessToken: {
    jwtPrivateKeyParam: string;
    jwtPublicKey: string;
    lifetime: Duration;
  };
  refreshToken: {
    lifetime: Duration;
  };
  exchange: {
    verifyEndpoint: string;
    secretParam: string;
  };
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
