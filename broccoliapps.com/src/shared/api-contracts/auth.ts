import { api } from "@broccoliapps/shared";
import { verifyAuthTokenRequest, verifyAuthTokenResponse } from "./auth.dto";

// POST /v1/auth/verify - verify auth token
export const verifyAuthToken = api("POST", "/v1/auth/verify")
  .withRequest(verifyAuthTokenRequest)
  .withResponse(verifyAuthTokenResponse);
