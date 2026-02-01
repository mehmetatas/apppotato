import * as v from "valibot";
import { globalConfig } from "./global-config";

// Central auth user DTO (broccoliapps.com user shape — different from framework's authUserDto)
export const centralAuthUserDto = v.object({
  userId: v.string(),
  email: v.string(),
  name: v.string(),
  provider: v.string(),
});
export type CentralAuthUserDto = v.InferOutput<typeof centralAuthUserDto>;

// POST /v1/auth/verify
export const centralVerifyAuthRequest = {
  app: v.pipe(v.string(), v.picklist(Object.keys(globalConfig.apps))),
  code: v.pipe(v.string(), v.maxLength(1024)),
};
export type CentralVerifyAuthRequest = v.InferOutput<v.ObjectSchema<typeof centralVerifyAuthRequest, undefined>>;

export const centralVerifyAuthResponse = {
  user: centralAuthUserDto,
};
export type CentralVerifyAuthResponse = v.InferOutput<v.ObjectSchema<typeof centralVerifyAuthResponse, undefined>>;

// POST /v1/auth/email
export const centralSendEmailRequest = {
  app: v.pipe(v.string(), v.picklist(Object.keys(globalConfig.apps))),
  email: v.pipe(v.string(), v.email()),
  platform: v.optional(v.picklist(["mobile"])),
};
export type CentralSendEmailRequest = v.InferOutput<v.ObjectSchema<typeof centralSendEmailRequest, undefined>>;

export const centralSendEmailResponse = {
  success: v.boolean(),
};
export type CentralSendEmailResponse = v.InferOutput<v.ObjectSchema<typeof centralSendEmailResponse, undefined>>;

// POST /v1/auth/verify-native
export const centralVerifyNativeRequest = {
  app: v.pipe(v.string(), v.picklist(Object.keys(globalConfig.apps))),
  email: v.pipe(v.string(), v.email()),
  name: v.string(),
  provider: v.picklist(["apple"]),
};
export type CentralVerifyNativeRequest = v.InferOutput<v.ObjectSchema<typeof centralVerifyNativeRequest, undefined>>;

export const centralVerifyNativeResponse = {
  user: centralAuthUserDto,
};
export type CentralVerifyNativeResponse = v.InferOutput<v.ObjectSchema<typeof centralVerifyNativeResponse, undefined>>;
