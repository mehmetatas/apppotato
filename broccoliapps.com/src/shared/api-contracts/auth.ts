import { JwtData } from "@broccoliapps/backend/dist/auth/jwt";
import { api, globalConfig } from "@broccoliapps/shared";
import * as v from "valibot";

export const verifyAuthToken = api("POST", "/v1/auth/verify")
  .withRequest({
    app: v.pipe(v.string(), v.picklist(Object.keys(globalConfig.apps))),
    code: v.pipe(v.string(), v.maxLength(1024)),
  })
  .withResponse<JwtData>();
