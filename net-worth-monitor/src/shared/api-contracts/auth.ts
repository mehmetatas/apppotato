import { api } from "@broccoliapps/shared";
import * as v from "valibot";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  isNewUser: boolean;
  targetCurrency: string | null;
};

export const authExchange = api("POST", "/auth/exchange")
  .withRequest({
    code: v.pipe(v.string(), v.maxLength(1024)),
  })
  .withResponse<{
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
    user: AuthUser;
  }>();

export type TokenRefresh = {
  id: string;
  email: string;
  name: string;
  isNewUser: boolean;
  targetCurrency: string | null;
};

export const refreshToken = api("POST", "/auth/refresh")
  .withRequest({
    refreshToken: v.pipe(v.string(), v.maxLength(1024)),
  })
  .withResponse<{
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }>();
