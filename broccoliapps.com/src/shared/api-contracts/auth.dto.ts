import * as v from "valibot";
import { globalConfig } from "@broccoliapps/shared";
import { authUserDto } from "./dto";

// POST /v1/auth/verify - verify auth token
export const verifyAuthTokenRequest = {
  app: v.pipe(v.string(), v.picklist(Object.keys(globalConfig.apps))),
  code: v.pipe(v.string(), v.maxLength(1024)),
};
export type VerifyAuthTokenRequest = v.InferOutput<v.ObjectSchema<typeof verifyAuthTokenRequest, undefined>>;

export const verifyAuthTokenResponse = {
  user: authUserDto,
};
export type VerifyAuthTokenResponse = v.InferOutput<v.ObjectSchema<typeof verifyAuthTokenResponse, undefined>>;
